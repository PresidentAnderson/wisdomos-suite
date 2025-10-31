export class ContributionCreatedEvent {
  constructor(public readonly contribution: any) {}
}

export class ContributionUpdatedEvent {
  constructor(public readonly contribution: any) {}
}

export class ContributionDeletedEvent {
  constructor(public readonly contribution: any) {}
}