import mongoose from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderStatus } from "@castickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async() => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

   // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'fwerf'
  });
  await ticket.save();

  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'rffwerfwe',
    expiresAt: 'fwrefvr',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, ticket, data, msg };
};


it('sets the userid of the ticket', async() => {
  const { listener, ticket, data, msg } = await setup();
  
  // call the on Message function with the data object and message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);


});

it('acks the message', async() => {
  const { listener, ticket, data, msg } = await setup();
  
  // call the on Message function with the data object and message object
  await listener.onMessage(data, msg);
  // write assertions to  make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();

});

it('publishes a ticket updated event', async() => {
  const { listener, ticket, data, msg } = await setup();
  
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});