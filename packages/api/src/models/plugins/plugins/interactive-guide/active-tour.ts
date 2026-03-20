import Tour from 'shepherd.js/src/types/tour';

export type ActiveTour = Tour & {
  options: {
    confirmCancel: boolean;
    tourName: string;
  }
}
