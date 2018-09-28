import { Factory } from "@app/test/factory";
import { StudyStoreActions } from "@app/root-store/study";
import { SearchParams } from "@app/domain";

describe('study-store actions', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('GetStudyCountsRequest', () => {
    const action = new StudyStoreActions.GetStudyCountsRequest();
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.GetStudyCountsRequest
    });
  });

  it('GetStudyCountsSuccess', () => {
    const payload = {
      studyCounts: factory.studyCounts()
    };
    const action = new StudyStoreActions.GetStudyCountsSuccess(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.GetStudyCountsSuccess,
      payload
    });
  });

  it('GetStudyCountsFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.GetStudyCountsFailure(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.GetStudyCountsFailure,
      payload
    });
  });

  it('SearchStudiesRequest', () => {
    const payload = {
      searchParams: new SearchParams()
    };
    const action = new StudyStoreActions.SearchStudiesRequest(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.SearchStudiesRequest,
      payload
    });
  });

  it('SearchStudiesSuccess', () => {
    const payload = {
      pagedReply: factory.pagedReply([])
    };
    const action = new StudyStoreActions.SearchStudiesSuccess(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.SearchStudiesSuccess,
      payload
    });
  });

  it('SearchStudiesFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.SearchStudiesFailure(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.SearchStudiesFailure,
      payload
    });
  });

  it('AddStudyRequest', () => {
    const payload = {
      study: factory.study()
    };
    const action = new StudyStoreActions.AddStudyRequest(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.AddStudyRequest,
      payload
    });
  });

  it('AddStudySuccess', () => {
    const payload = {
      study: factory.study()
    };
    const action = new StudyStoreActions.AddStudySuccess(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.AddStudySuccess,
      payload
    });
  });

  it('AddStudyFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.AddStudyFailure(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.AddStudyFailure,
      payload
    });
  });

  it('GetStudyRequest', () => {
    const payload = {
      slug: factory.study().slug
    };
    const action = new StudyStoreActions.GetStudyRequest(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.GetStudyRequest,
      payload
    });
  });

  it('GetStudySuccess', () => {
    const payload = {
      study: factory.study()
    };
    const action = new StudyStoreActions.GetStudySuccess(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.GetStudySuccess,
      payload
    });
  });

  it('GetStudyFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new StudyStoreActions.GetStudyFailure(payload);
    expect({ ...action }).toEqual({
      type: StudyStoreActions.ActionTypes.GetStudyFailure,
      payload
    });
  });

});
