import { Message } from "node-nats-streaming";
import { Subjects, Listener, OrderCreatedEvent } from "@castickets/common";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version
    });
    await order.save();
    
    msg.ack();
  }
}