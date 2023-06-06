import { Publisher, Subjects, ExpirationCompleteEvent } from "@castickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete= Subjects.ExpirationComplete;
}