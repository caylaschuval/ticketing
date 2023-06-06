import mongoose from "mongoose";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@castickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketCreatedListener } from "../ticket-created-listener";

const setup = async() => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    price: 999,
    userId: 'frwrwf',
    title: 'new concert'
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, data, ticket, msg };
};


it('finds, updates, and saves a ticket', async() => {
  const { listener, data, ticket, msg } = await setup();
  
  // call the on Message function with the data object and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async() => {
  const { listener, data, ticket, msg } = await setup();
  
  // call the on Message function with the data object and message object
  await listener.onMessage(data, msg);
  // write assertions to  make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();

});

it('does not call ack if the event has a skipped version number', async() => {
  const { listener, data, ticket, msg } = await setup();
  
  data.version = 10;
  
  try{
    await listener.onMessage(data, msg);
  } catch(err) {}
  
  // write assertions to  make sure ack function is called
  expect(msg.ack).not.toHaveBeenCalled();

});