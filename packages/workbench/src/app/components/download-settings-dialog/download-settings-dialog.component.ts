import {Component, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TranslocoPipe} from '@jsverse/transloco';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Select, SelectChangeEvent} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Tooltip} from 'primeng/tooltip';
import {ApplicationSettingsStorageService, JsonldExportSettings, service} from '@ontotext/workbench-api';
import {Button} from 'primeng/button';
import {DownloadSettingsDialogData} from './models/download-settings-dialog-data';

interface JSONLDModeOption {
  label: string;
  value: string;
}

enum JSONLDMode {
  FRAMED = 'framed',
  EXPANDED = 'expanded',
  FLATTENED = 'flattened',
  COMPACTED = 'compacted'
}

@Component({
  selector: 'app-download-settings-dialog',
  imports: [
    TranslocoPipe,
    FormsModule,
    Select,
    InputText,
    Tooltip,
    Button
  ],
  templateUrl: './download-settings-dialog.component.html',
  styleUrl: './download-settings-dialog.component.scss'
})
export class DownloadSettingsDialogComponent implements OnInit {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig: DynamicDialogConfig<DownloadSettingsDialogData> = inject(DynamicDialogConfig);
  private readonly applicationSettingsStorageService = service(ApplicationSettingsStorageService);
  private readonly JSONLDModes: Record<string, string> = {
    [JSONLDMode.FRAMED]: 'http://www.w3.org/ns/json-ld#framed',
    [JSONLDMode.EXPANDED]: 'http://www.w3.org/ns/json-ld#expanded',
    [JSONLDMode.FLATTENED]: 'http://www.w3.org/ns/json-ld#flattened',
    [JSONLDMode.COMPACTED]: 'http://www.w3.org/ns/json-ld#compacted'
  };
  private readonly JSONLDFramedModes = [JSONLDMode.FRAMED];
  private readonly JSONLDContextModes = [JSONLDMode.COMPACTED, JSONLDMode.FLATTENED];
  private readonly defaultMode = JSONLDMode.EXPANDED;

  readonly JSONLDModeOptions: JSONLDModeOption[] = Object.keys(this.JSONLDModes).map(key => ({label: this.JSONLDModes[key], value: key}));

  currentMode = this.defaultMode;
  link?: string;
  isFramedMode = signal(false);
  isContextMode = signal(false);

  constructor() {
    this.dialogConfig.data = {
      exportAction: this.exportJsonLD.bind(this),
      resetAction: this.reset.bind(this)
    };
  }

  ngOnInit() {
    const jsonldSettingsModel = this.applicationSettingsStorageService.getJsonLDExportSettings();
    if (jsonldSettingsModel?.formName && this.isJSONLDMode(jsonldSettingsModel.formName)) {
      this.setJSONLDMode(jsonldSettingsModel.formName);
      this.link = jsonldSettingsModel.link;
    }
  }

  exportJsonLD() {
    this.setJSONLDSettingsToLocalStorage(this.currentMode, this.link);
    const result: JsonldExportSettings = {
      formName: this.currentMode,
      formLink: this.JSONLDModes[this.currentMode],
      link: this.link
    };
    this.dialogRef.close(result);
  }

  reset() {
    this.setJSONLDMode(this.defaultMode);
    this.link = undefined;
    this.setJSONLDSettingsToLocalStorage(this.currentMode, this.link);
  }

  clearLinkInput(event: SelectChangeEvent) {
    this.setJSONLDMode(event.value);
    this.link = undefined;
    this.setJSONLDSettingsToLocalStorage(this.currentMode, this.link);
  }

  private setJSONLDMode(mode: JSONLDMode) {
    this.currentMode = mode;
    this.isFramedMode.set(this.JSONLDFramedModes.includes(mode));
    this.isContextMode.set(this.JSONLDContextModes.includes(mode));
  }

  private isJSONLDMode(value: string): value is JSONLDMode {
    return Object.values(JSONLDMode).includes(value as JSONLDMode);
  }

  private setJSONLDSettingsToLocalStorage(mode?: string, link?: string) {
    if (!mode) {
      return;
    }
    const formLink = this.JSONLDModes[mode];
    this.applicationSettingsStorageService.setJsonLDExportSettings({
      formName: mode,
      formLink: formLink,
      link: link
    });
  }
}
