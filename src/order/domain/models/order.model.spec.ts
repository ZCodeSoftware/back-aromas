import { OrderChannel } from '../enum/order-channel.enum';
import { OrderStatus } from '../enum/order-status.enum';
import { ShippingType } from '../enum/shipping-type.enum';
import { OrderItemModel } from './order-item.model';
import { OrderModel } from './order.model';

const line = (unitPrice: number, quantity: number) =>
    OrderItemModel.create({ product: { _id: 'p1' }, name: 'Vela', unitPrice, quantity });

describe('OrderModel', () => {
    describe('create (online checkout)', () => {
        it('starts PENDING on the ONLINE channel', () => {
            const order = OrderModel.create({
                user: 'u1',
                shippingType: ShippingType.DELIVERY,
                shippingPrice: 1500,
            });

            expect(order.status).toBe(OrderStatus.PENDING);
            expect(order.channel).toBe(OrderChannel.ONLINE);
            expect(order.stockRestored).toBe(false);
        });

        it('adds shipping on top of the subtotal', () => {
            const order = OrderModel.create({
                user: 'u1',
                shippingType: ShippingType.DELIVERY,
                shippingPrice: 1500,
            });
            order.addItem(line(19.99, 3));

            const json = order.toJSON();
            expect(json.subTotalPrice).toBe(59.97);
            expect(json.totalPrice).toBe(1559.97);
        });
    });

    describe('createPosSale', () => {
        it('is born paid, picked up, with no shipping cost', () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1', customer: { name: 'Ana' } });

            const json = sale.toJSON();
            expect(sale.status).toBe(OrderStatus.PAID);
            expect(sale.channel).toBe(OrderChannel.POS);
            expect(json.shippingType).toBe(ShippingType.PICKUP);
            expect(json.shippingPrice).toBe(0);
            expect(json.stockRestored).toBe(false);
            expect(json.soldBy).toBe('admin1');
            expect(json.customer).toEqual({ name: 'Ana' });
            expect(json.user).toBeNull();
        });

        it('leaves revenue equal to the subtotal', () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1' });
            sale.addItem(line(8900, 2));

            const json = sale.toJSON();
            expect(json.subTotalPrice).toBe(17800);
            expect(json.totalPrice).toBe(17800);
        });

        it('keeps a linked customer on the order', () => {
            const sale = OrderModel.createPosSale({ user: 'u9', soldBy: 'admin1' });

            expect(sale.userId).toBe('u9');
        });
    });

    describe('userId', () => {
        it('is null for an anonymous counter sale', () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1' });

            expect(sale.userId).toBeNull();
        });

        it('never equals a real requester id when the order has no user', () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1' });

            expect(sale.userId).not.toBe('undefined');
            expect(sale.userId === String('u1')).toBe(false);
        });
    });

    describe('changeStatus', () => {
        it('allows PAID to REFUNDED', () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1' });

            sale.changeStatus(OrderStatus.REFUNDED);

            expect(sale.status).toBe(OrderStatus.REFUNDED);
        });

        it('rejects a second refund, because REFUNDED is terminal', () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1' });
            sale.changeStatus(OrderStatus.REFUNDED);

            expect(() => sale.changeStatus(OrderStatus.REFUNDED)).toThrow(
                /Cannot move an order from REFUNDED/,
            );
        });

        it('rejects refunding an order that was never paid', () => {
            const order = OrderModel.create({ user: 'u1', shippingType: ShippingType.PICKUP });

            expect(() => order.changeStatus(OrderStatus.REFUNDED)).toThrow(
                /Cannot move an order from PENDING to REFUNDED/,
            );
        });

        it('still allows the online happy path', () => {
            const order = OrderModel.create({ user: 'u1', shippingType: ShippingType.PICKUP });

            order.changeStatus(OrderStatus.PAID);
            order.changeStatus(OrderStatus.SHIPPED);
            order.changeStatus(OrderStatus.DELIVERED);

            expect(order.status).toBe(OrderStatus.DELIVERED);
        });
    });

    describe('hydrate', () => {
        it('treats a document with no channel as ONLINE', () => {
            const order = OrderModel.hydrate({
                _id: 'o1',
                user: 'u1',
                items: [],
                status: OrderStatus.PAID,
            });

            expect(order.channel).toBe(OrderChannel.ONLINE);
            expect(order.toJSON().soldBy).toBeNull();
            expect(order.toJSON().customer).toBeNull();
        });

        it('reads back a stored POS sale', () => {
            const sale = OrderModel.hydrate({
                _id: 'o2',
                items: [],
                status: OrderStatus.PAID,
                channel: OrderChannel.POS,
                soldBy: 'admin1',
                customer: { name: 'Ana', phone: '123' },
            });

            expect(sale.channel).toBe(OrderChannel.POS);
            expect(sale.userId).toBeNull();
            expect(sale.toJSON().customer).toEqual({ name: 'Ana', phone: '123' });
        });
    });
});
