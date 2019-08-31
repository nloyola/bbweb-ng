import { ParticipantStoreReducer, ParticipantStoreSelectors } from '@app/root-store';
import { Factory } from '@test/factory';
import { SearchParams, PagedReplyEntityIds } from '@app/domain';
import { Participant } from '@app/domain/participants';
import { EntityAdapter, createEntityAdapter } from '@ngrx/entity';

describe('participant-store selectors', () => {
  const factory = new Factory();

  it('selectParticipantLastAdded', () => {
    const participant = factory.participant();
    const state = {
      participant: {
        ...ParticipantStoreReducer.initialState,
        lastAddedId: participant.id
      }
    };

    expect(ParticipantStoreSelectors.selectParticipantLastAddedId(state)).toBe(participant.id);
  });

  it('selectAllParticipants', () => {
    const participant = new Participant().deserialize(factory.participant());
    const adapter: EntityAdapter<Participant> = createEntityAdapter<Participant>({
      selectId: (s: Participant) => s.id
    });
    const state = {
      participant: adapter.addAll([participant], ParticipantStoreReducer.initialState)
    };

    expect(ParticipantStoreSelectors.selectAllParticipants(state)).toEqual([participant]);
  });
});
