export const texts = {
  map: {
    title: 'Karte',
    centerOnUserButton: 'Meine Position zentrieren',
    locationUnavailable: 'Standort konnte nicht ermittelt werden.',
    gpsDisabled: 'Bitte aktivieren Sie die Standortdienste (GPS), um Ihre Position zu sehen.',
    retry: 'Erneut versuchen'
  },
  permission: {
    requestTitle: 'Standort verwenden',
    requestMessage:
      'Wir benötigen Ihren Standort, um Ihre aktuelle Position auf der Karte anzeigen zu können.',
    deniedMessage:
      'Ohne die Berechtigung können wir Ihre Position nicht anzeigen. Bitte erteilen Sie den Zugriff.',
    blockedMessage:
      'Die Berechtigung wurde vom System blockiert. Öffnen Sie die Einstellungen, um den Zugriff zu erlauben.',
    requestAction: 'Berechtigung anfragen',
    settingsAction: 'Einstellungen öffnen'
  },
  errors: {
    timeout: 'Zeitüberschreitung bei der Standortbestimmung.',
    unknown: 'Es ist ein unbekannter Fehler aufgetreten.'
  }
} as const;

export type Texts = typeof texts;
