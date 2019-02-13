import { Factory } from '@test/factory';
import { CentreStoreActions } from '@app/root-store/centre';
import { SearchParams } from '@app/domain';

describe('centre-store actions', () => {

  let factory: Factory;

  beforeEach(() => {
    factory = new Factory();
  });

  it('GetCentreCountsRequest', () => {
    const action = new CentreStoreActions.GetCentreCountsRequest();
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.GetCentreCountsRequest
    });
  });

  it('GetCentreCountsSuccess', () => {
    const payload = {
      centreCounts: factory.centreCounts()
    };
    const action = new CentreStoreActions.GetCentreCountsSuccess(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.GetCentreCountsSuccess,
      payload
    });
  });

  it('GetCentreCountsFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new CentreStoreActions.GetCentreCountsFailure(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.GetCentreCountsFailure,
      payload
    });
  });

  it('SearchCentresRequest', () => {
    const payload = {
      searchParams: new SearchParams()
    };
    const action = new CentreStoreActions.SearchCentresRequest(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.SearchCentresRequest,
      payload
    });
  });

  it('SearchCentresSuccess', () => {
    const payload = {
      pagedReply: factory.pagedReply([])
    };
    const action = new CentreStoreActions.SearchCentresSuccess(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.SearchCentresSuccess,
      payload
    });
  });

  it('SearchCentresFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new CentreStoreActions.SearchCentresFailure(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.SearchCentresFailure,
      payload
    });
  });

  it('AddCentreRequest', () => {
    const payload = {
      centre: factory.centre()
    };
    const action = new CentreStoreActions.AddCentreRequest(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.AddCentreRequest,
      payload
    });
  });

  it('AddCentreSuccess', () => {
    const payload = {
      centre: factory.centre()
    };
    const action = new CentreStoreActions.AddCentreSuccess(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.AddCentreSuccess,
      payload
    });
  });

  it('AddCentreFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new CentreStoreActions.AddCentreFailure(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.AddCentreFailure,
      payload
    });
  });

  it('GetCentreRequest', () => {
    const payload = {
      slug: factory.centre().slug
    };
    const action = new CentreStoreActions.GetCentreRequest(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.GetCentreRequest,
      payload
    });
  });

  it('GetCentreSuccess', () => {
    const payload = {
      centre: factory.centre()
    };
    const action = new CentreStoreActions.GetCentreSuccess(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.GetCentreSuccess,
      payload
    });
  });

  it('GetCentreFailure', () => {
    const payload = {
      error: {
        status: 404,
        error: {
          message: 'simulated error'
        }
      }
    };
    const action = new CentreStoreActions.GetCentreFailure(payload);
    expect({ ...action }).toEqual({
      type: CentreStoreActions.ActionTypes.GetCentreFailure,
      payload
    });
  });

});
