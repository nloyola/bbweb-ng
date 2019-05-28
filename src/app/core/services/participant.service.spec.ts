import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AnnotationType } from '@app/domain/annotations';
import { Participant } from '@app/domain/participants';
import { Factory } from '@test/factory';
import { ParticipantService } from './participant.service';

describe('ParticipantService', () => {

  const BASE_URL = '/api/participants';

  let httpMock: HttpTestingController;
  let service: ParticipantService;
  const factory = new Factory();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [ParticipantService]
    });

    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(ParticipantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when requesting a participant', () => {
    let annotationType: AnnotationType;
    let rawParticipant: any;
    let participant: Participant;

    beforeEach(() => {
      annotationType = factory.annotationType();
      rawParticipant = factory.participant({ annotationTypes: [annotationType] });
      participant = new Participant().deserialize(rawParticipant);
    });

    it('reply is handled correctly', () => {
      service.get(participant.slug).subscribe(s => {
        expect(s).toEqual(jasmine.any(Participant));
      });

      const req = httpMock.expectOne(`${BASE_URL}/${participant.slug}`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'success', data: rawParticipant });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      service.get(participant.slug).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a participant object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${participant.slug}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('when adding a participant', () => {

    it('request contains correct JSON and reply is handled correctly', () => {
      const rawParticipant = factory.participant();
      const participant = new Participant().deserialize(rawParticipant);

      service.add(participant).subscribe(s => {
        expect(s).toEqual(jasmine.any(Participant));
        expect(s).toEqual(participant);
      });

      const req = httpMock.expectOne(`${BASE_URL}/${participant.study.id}`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        uniqueId: participant.uniqueId,
        annotations: []
      });
      req.flush({ status: 'success', data: rawParticipant });
      httpMock.verify();
    });

    it('handles an error reply correctly', () => {
      const rawParticipant = factory.participant();
      const participant = new Participant().deserialize(rawParticipant);

      service.add(participant).subscribe(
        () => { fail('should have been an error response'); },
        err => { expect(err.message).toContain('expected a participant object'); }
      );

      const req = httpMock.expectOne(`${BASE_URL}/${participant.study.id}`);
      req.flush({ status: 'error', data: undefined });
      httpMock.verify();
    });

  });

  describe('for updating a participant', () => {

    const annotationType = factory.annotationType();
    const annotation = factory.annotation(null, annotationType);
    let rawParticipant: any;
    let participant: Participant;
    let testData: any;

    beforeEach(() => {
      rawParticipant = factory.participant();
      participant = new Participant().deserialize(rawParticipant);
      testData = [
        {
          attribute: 'uniqueId',
          value: factory.stringNext(),
          url: `${BASE_URL}/uniqueId/${participant.id}`
        },
        {
          attribute: 'addAnnotation',
          value: annotation,
          url: `${BASE_URL}/annot/${participant.id}`
        },
        {
          attribute: 'removeAnnotation',
          value: undefined,
          url: `${BASE_URL}/annot/${participant.id}/${participant.version}/${annotation.id}`
        }
      ];

    });

    it('request contains correct JSON and reply is handled correctly', () => {
      testData.forEach(testInfo => {
        service.update(participant, testInfo.attribute, testInfo.value).subscribe(s => {
          expect(s).toEqual(jasmine.any(Participant));
          expect(s).toEqual(participant);
        });

        let expectedJson = { expectedVersion: participant.version };

        switch (testInfo.attribute) {
          case 'addAnnotation':
            expectedJson = { ...expectedJson, ...testInfo.value };
            break;

          case 'removeAnnotation':
            // empty on purpose
            break;

          default:
            expectedJson[testInfo.attribute] = testInfo.value;
        }

        const req = httpMock.expectOne(testInfo.url);

        if (testInfo.attribute === 'removeAnnotation') {
          expect(req.request.method).toBe('DELETE');
        } else {
          expect(req.request.method).toBe('POST');
          expect(req.request.body).toEqual(expectedJson);
        }
        req.flush({ status: 'success', data: rawParticipant });
        httpMock.verify();
      });
    });

    it('handles an error reply correctly', () => {
      testData.forEach((testInfo: any) => {
        service.update(participant, testInfo.attribute, testInfo.value).subscribe(
          () => { fail('should have been an error response'); },
          err => { expect(err.message).toContain('expected a participant object'); }
        );

        const req = httpMock.expectOne(testInfo.url);
        req.flush({ status: 'error', data: undefined });
        httpMock.verify();
      });
    });

    it('throws an exception for invalid input', () => {
      testData = [
        {
          attribute: factory.stringNext(),
          value: factory.stringNext(),
          url: `${BASE_URL}/name/${participant.id}`,
          expectedErrMsg: /invalid attribute name for update/
        }
      ];
      testData.forEach((testInfo: any) => {
        expect(() => service.update(participant, testInfo.attribute, testInfo.value))
          .toThrowError(testInfo.expectedErrMsg);
      });
    });
  });

});
