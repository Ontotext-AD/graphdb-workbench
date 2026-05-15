import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {UnsavedChangesComponent} from './unsaved-changes-component';
import {UnsavedChangesService} from '../../services/unsaved-changes/unsaved-changes.service';

@Component({standalone: true, template: ''})
class TestUnsavedChangesComponent extends UnsavedChangesComponent {
  hasUnsavedChanges() { return false; }
}

const mockUnsavedChangesService = {
  registerComponent: jest.fn(),
  unregisterComponent: jest.fn()
};

describe('UnsavedChangesComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        {provide: UnsavedChangesService, useValue: mockUnsavedChangesService}
      ]
    });
  });

  it('should register itself with UnsavedChangesService on creation', () => {
    const fixture = TestBed.createComponent(TestUnsavedChangesComponent);
    expect(mockUnsavedChangesService.registerComponent).toHaveBeenCalledWith(fixture.componentInstance);
  });

  it('should unregister itself from UnsavedChangesService on destroy', () => {
    const fixture = TestBed.createComponent(TestUnsavedChangesComponent);
    fixture.destroy();
    expect(mockUnsavedChangesService.unregisterComponent).toHaveBeenCalledWith(fixture.componentInstance);
  });
});