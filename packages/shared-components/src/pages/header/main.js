const setValidLicense = () => {
  updateLicense({
      "expiryDate": 1734077569000,
      "latestPublicationDate": 1734077569000,
      "licensee": "Example Company",
      "maxCpuCores": 4,
      "product": "GraphDB",
      "productType": "Enterprise",
      "licenseCapabilities": ["Capability.CLUSTER"],
      "version": "1.0",
      "installationId": "inst-123",
      "valid": true,
      "typeOfUse": "Production",
      "message": "Valid license"
    }
  )
}

const setInvalidLicense = () => {
  updateLicense({
      "expiryDate": 1734077569000,
      "latestPublicationDate": 1734077569000,
      "licensee": "Example Company",
      "maxCpuCores": 4,
      "product": "GraphDB",
      "productType": "Enterprise",
      "licenseCapabilities": ["Capability.CLUSTER"],
      "version": "1.0",
      "installationId": "inst-123",
      "valid": false,
      "typeOfUse": "Production",
      "message": "Invalid license"
    }
  )
}
