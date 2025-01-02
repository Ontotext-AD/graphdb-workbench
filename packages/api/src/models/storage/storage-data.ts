/**
 * Represents a wrapper of the data obtained from the storage with methods to convert it to different formats.
 */
export class StorageData {
  /**
   * The value obtained from the storage.
   */
  value: string | null;

  /**
   * Creates a new instance of the StorageData class.
   * @param value The value obtained from the storage.
   */
  constructor(value: string | null) {
    this.value = value;
  }

  getValue(): string | null {
    return this.value;
  }

  /**
   * Returns the value as a JSON object or null if the value is not a valid JSON. Conversion is done using JSON.parse.
   */
  getAsJson(): unknown {
    if (this.value === null) {
      return null;
    }
    try {
      return JSON.parse(this.value);
    } catch (error) {
      console.error('Error parsing JSON', error);
      return null;
    }
  }
}

