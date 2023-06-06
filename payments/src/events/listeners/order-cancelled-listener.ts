import { Message } from "node-nats-streaming";
import { Subjects, Listener, OrderCancelledEvent, OrderStatus } from "@castickets/common";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // find the ticket that the order is reserving
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1 
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled
    });
  
    await order.save();
    
    msg.ack();
  }
}