import { OrderChannel } from '../../domain/enum/order-channel.enum';
import { OrderStatus } from '../../domain/enum/order-status.enum';
import { ShippingType } from '../../domain/enum/shipping-type.enum';
import { OrderItemModel } from '../../domain/models/order-item.model';
import { OrderModel } from '../../domain/models/order.model';
import { PosService } from './pos.service';
import { StockReservationService } from './stock-reservation.service';

const product = (over: Partial<any> = {}) => ({
    _id: 'p1',
    name: 'Vela Lavanda',
    price: 100,
    stock: 10,
    isActive: true,
    ...over,
});

/** Real StockReservationService over a mocked product repo: the compensating
 *  release is the part worth exercising, not a stub of it. */
const build = (over: { products?: any; order?: any; payment?: any; user?: any; metrics?: any } = {}) => {
    const productRepository = {
        findById: jest.fn().mockResolvedValue(product()),
        decrementStock: jest.fn().mockResolvedValue(true),
        incrementStock: jest.fn().mockResolvedValue(true),
        ...over.products,
    };
    const orderRepository = {
        create: jest.fn().mockImplementation((model: OrderModel) => Promise.resolve(model)),
        findById: jest.fn(),
        update: jest.fn().mockImplementation((_id: string, model: OrderModel) => Promise.resolve(model)),
        findAll: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
        ...over.order,
    };
    const catPaymentMethodRepository = {
        findById: jest.fn().mockResolvedValue({ _id: 'pm1', name: 'CASH' }),
        ...over.payment,
    };
    const userRepository = {
        findById: jest.fn().mockResolvedValue({
            toJSON: () => ({ firstName: 'Ana', lastName: 'Pérez', email: 'a@b.com', phone: '123' }),
        }),
        ...over.user,
    };
    const metricsRepository = {
        incrementSellTimes: jest.fn().mockResolvedValue(undefined),
        ...over.metrics,
    };

    const stockReservation = new StockReservationService(productRepository as any);
    const service = new PosService(
        orderRepository as any,
        productRepository as any,
        catPaymentMethodRepository as any,
        userRepository as any,
        metricsRepository as any,
        stockReservation,
    );

    return { service, productRepository, orderRepository, catPaymentMethodRepository, userRepository, metricsRepository };
};

describe('PosService', () => {
    describe('createSale', () => {
        it('persists a PAID sale on the POS channel and takes the stock', async () => {
            const { service, orderRepository, productRepository, metricsRepository } = build();

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 2 }],
                paymentMethod: 'pm1',
            });

            const json = sale.toJSON();
            expect(json.channel).toBe(OrderChannel.POS);
            expect(json.status).toBe(OrderStatus.PAID);
            expect(json.shippingType).toBe(ShippingType.PICKUP);
            expect(json.soldBy).toBe('admin1');
            expect(json.totalPrice).toBe(200);
            expect(orderRepository.create).toHaveBeenCalledTimes(1);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p1', 2);
            expect(metricsRepository.incrementSellTimes).toHaveBeenCalledWith('p1', 2);
        });

        it('merges repeated products into one line before checking stock', async () => {
            const { service, productRepository } = build();

            const sale = await service.createSale('admin1', {
                items: [
                    { productId: 'p1', quantity: 3 },
                    { productId: 'p1', quantity: 4 },
                ],
                paymentMethod: 'pm1',
            });

            expect(sale.items).toHaveLength(1);
            expect(sale.items[0].quantity).toBe(7);
            expect(productRepository.decrementStock).toHaveBeenCalledTimes(1);
            expect(productRepository.decrementStock).toHaveBeenCalledWith('p1', 7);
        });

        it('catches an over-sell that only the merged quantity reveals', async () => {
            const { service, productRepository } = build({
                products: { findById: jest.fn().mockResolvedValue(product({ stock: 5 })) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [
                        { productId: 'p1', quantity: 3 },
                        { productId: 'p1', quantity: 3 },
                    ],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('rejects supplying both a userId and a loose customer', async () => {
            const { service, catPaymentMethodRepository } = build();

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                    userId: 'u1',
                    customer: { name: 'Ana' },
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(catPaymentMethodRepository.findById).not.toHaveBeenCalled();
        });

        it('derives the customer snapshot from a linked account', async () => {
            const { service } = build();

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 1 }],
                paymentMethod: 'pm1',
                userId: 'u1',
            });

            expect(sale.toJSON().customer).toEqual({
                name: 'Ana Pérez',
                email: 'a@b.com',
                phone: '123',
            });
            expect(sale.userId).toBe('u1');
        });

        it('keeps an anonymous walk-in sale', async () => {
            const { service } = build();

            const sale = await service.createSale('admin1', {
                items: [{ productId: 'p1', quantity: 1 }],
                paymentMethod: 'pm1',
            });

            expect(sale.userId).toBeNull();
            expect(sale.toJSON().customer).toBeNull();
        });

        it('404s on an unknown payment method', async () => {
            const { service, productRepository } = build({
                payment: { findById: jest.fn().mockResolvedValue(null) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'nope',
                }),
            ).rejects.toMatchObject({ statusCode: 404 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('refuses an inactive product without touching stock', async () => {
            const { service, productRepository } = build({
                products: { findById: jest.fn().mockResolvedValue(product({ isActive: false })) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 1 }],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.decrementStock).not.toHaveBeenCalled();
        });

        it('gives back the first line when the second loses the stock race', async () => {
            const decrementStock = jest
                .fn()
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);
            const { service, productRepository, orderRepository } = build({
                products: {
                    findById: jest
                        .fn()
                        .mockResolvedValueOnce(product({ _id: 'p1' }))
                        .mockResolvedValueOnce(product({ _id: 'p2' })),
                    decrementStock,
                },
            });

            await expect(
                service.createSale('admin1', {
                    items: [
                        { productId: 'p1', quantity: 1 },
                        { productId: 'p2', quantity: 1 },
                    ],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toMatchObject({ statusCode: 400 });

            expect(productRepository.incrementStock).toHaveBeenCalledTimes(1);
            expect(productRepository.incrementStock).toHaveBeenCalledWith('p1', 1);
            expect(orderRepository.create).not.toHaveBeenCalled();
        });

        it('gives back everything reserved when the insert fails', async () => {
            const boom = new Error('write concern');
            const { service, productRepository } = build({
                order: { create: jest.fn().mockRejectedValue(boom) },
            });

            await expect(
                service.createSale('admin1', {
                    items: [{ productId: 'p1', quantity: 2 }],
                    paymentMethod: 'pm1',
                }),
            ).rejects.toBe(boom);

            expect(productRepository.incrementStock).toHaveBeenCalledWith('p1', 2);
        });
    });

    describe('refund', () => {
        const paidPosSale = () => {
            const sale = OrderModel.createPosSale({ soldBy: 'admin1' });
            sale.addItem(
                OrderItemModel.create({
                    product: { _id: 'p1' },
                    name: 'Vela',
                    unitPrice: 100,
                    quantity: 2,
                }),
            );

            return sale;
        };

        it('refunds a POS sale and restores its units', async () => {
            const sale = paidPosSale();
            const { service, productRepository, orderRepository } = build({
                order: {
                    findById: jest.fn().mockResolvedValue(sale),
                    update: jest.fn().mockImplementation((_id, model) => Promise.resolve(model)),
                },
            });

            const refunded = await service.refund('o1');

            expect(refunded.status).toBe(OrderStatus.REFUNDED);
            expect(refunded.stockRestored).toBe(true);
            expect(productRepository.incrementStock).toHaveBeenCalledWith('p1', 2);
            expect(orderRepository.update).toHaveBeenCalledWith('o1', sale);
        });

        it('refuses to refund an online order through the POS endpoint', async () => {
            const onlineOrder = OrderModel.create({ user: 'u1', shippingType: ShippingType.PICKUP });
            const { service, productRepository } = build({
                order: { findById: jest.fn().mockResolvedValue(onlineOrder) },
            });

            await expect(service.refund('o1')).rejects.toMatchObject({ statusCode: 400 });
            expect(productRepository.incrementStock).not.toHaveBeenCalled();
        });

        it('rejects a second refund and leaves stock alone', async () => {
            const sale = paidPosSale();
            const { service, productRepository } = build({
                order: { findById: jest.fn().mockResolvedValue(sale) },
            });

            await service.refund('o1');
            productRepository.incrementStock.mockClear();

            await expect(service.refund('o1')).rejects.toMatchObject({ statusCode: 400 });
            expect(productRepository.incrementStock).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('forces the POS channel over whatever the caller asked for', async () => {
            const { service, orderRepository } = build();

            await service.findAll({ channel: OrderChannel.ONLINE, page: 2 } as any);

            expect(orderRepository.findAll).toHaveBeenCalledWith(
                expect.objectContaining({ channel: OrderChannel.POS, page: 2 }),
            );
        });
    });
});
