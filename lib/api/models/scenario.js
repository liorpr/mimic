import uuid from 'uuid';
import { PersistentStorage } from 'api/storage';
import { MockedRequest } from 'api/models/mocked-request';
import Requests from 'api/requests';
import get from 'lodash/get';

export class Scenario {

  constructor({ id = uuid.v4(), name, active = true, mockedRequests = [] }) {
    mockedRequests = mockedRequests.map((mockedRequest) => new MockedRequest(mockedRequest));

    Object.assign(this, { id, name, active, mockedRequests });
  }

  rename(newName) {
    this.name = newName;
  }

  mockRequest(request) {
    const mockedRequest = new MockedRequest(request);
    this.mockedRequests.push(mockedRequest);

    return mockedRequest;
  }

  removeMockedRequest(mockedRequestId) {
    this.mockedRequests.forEach((request, index) => {
      if (request.id === mockedRequestId) {
        return this.mockedRequests.splice(index, 1);
      }
    });
  }

  updateMockedRequest(mockRequestId, request) {
    Requests.capturedRequests
      .filter((capturedRequest) => get(capturedRequest, 'mock.id') === mockRequestId)
      .forEach((capturedRequest) => Requests.update(capturedRequest.id, request.url, request.name));

    this.findMockedRequestById(mockRequestId).update(request);
  }

  findMockedRequestById(mockedRequestId) {
    return this.mockedRequests
      .filter((request) => request.id === mockedRequestId)[0];
  }

  toggleMockedRequest(mockedRequestId) {
    const mockedRequest = this.findMockedRequestById(mockedRequestId);

    mockedRequest.active = !mockedRequest.active;
  }

  export() {
    try {
      const mockedRequests = this.mockedRequests.map((mockedRequest) => mockedRequest.export());
      return Object.assign({}, this, { mockedRequests });
    } catch(ex) {
      if (__ENV === 'development') {
        console.log(ex);
      }
      return null;
    }
  }

  exportMock(mockId) {
    try {
      const mock = this.findMockedRequestById(mockId).export();
      return Object.assign({}, this, { mockedRequests: [mock] });
    } catch (ex) {
      if (__ENV === 'development') {
        console.log(ex);
      }
      return null;
    }
  }

  exportMocks(mockIds) {
    try {
      const mocks = mockIds
        .map((mockId) => this.findMockedRequestById(mockId).export());

      return Object.assign({}, this, { mockedRequests: mocks });
    } catch (ex) {
      if (__ENV === 'development') {
        console.log(ex);
      }
      return null;
    }
  }
}
