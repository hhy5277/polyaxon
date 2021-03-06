import { normalize } from 'normalizr';
import { Reducer } from 'redux';

import * as _ from 'lodash';

import { actionTypes, StatusesAction } from '../actions/statuses';
import { StatusSchema } from '../constants/schemas';
import { StatusEmptyState, StatusModel, StatusStateSchema } from '../models/status';
import { LastFetchedIds } from '../models/utils';

export const StatusesReducer: Reducer<StatusStateSchema> =
  (state: StatusStateSchema = StatusEmptyState, action: StatusesAction) => {
    let newState = {...state};

    const processStatus = function(status: StatusModel) {
      const id = status.id;
      newState.lastFetched.ids.push(id);
      if (!_.includes(newState.ids, id)) {
        newState.ids.push(id);
      }
      const normalizedStatuses = normalize(status, StatusSchema).entities.statuses;
      newState.byIds[id] = {
        ...newState.byIds[id], ...normalizedStatuses[id]
      };
      return newState;
    };

    switch (action.type) {
      case actionTypes.REQUEST_STATUSES:
        newState.lastFetched = new LastFetchedIds();
        return newState;
      case actionTypes.RECEIVE_STATUSES:
        newState.lastFetched = new LastFetchedIds();
        newState.lastFetched.count = action.count;
        for (const build of action.statuses) {
          newState = processStatus(build);
        }
        return newState;
      default:
        return state;
    }
  };
