import { myActive, myOrders } from '../lib/queue';
import { orderById, useStore } from '../lib/store';
import { Checkout } from './Checkout';
import { OrderList } from './OrderList';
import { StallList } from './StallList';
import { StallMenu } from './StallMenu';
import { TabBar } from './TabBar';
import { Ticket } from './Ticket';

export function CustomerApp() {
  const state = useStore();
  const { cust, orders } = state;
  const active = myActive(orders);

  // เปิดบัตรคิวได้เฉพาะออเดอร์ที่ยังไม่จบ ไม่งั้นจะค้างอยู่หน้าที่ออกไปไหนไม่ได้
  const viewing = cust.view === 'ticket' ? orderById(cust.ticketId) : null;
  const live =
    viewing !== null &&
    (viewing.status === 'unpaid' || viewing.status === 'queued' || viewing.status === 'ready');

  if (cust.tab === 'mine' && live && viewing) {
    return (
      <div className="screen">
        <Ticket order={viewing} orders={orders} />
      </div>
    );
  }

  let body;
  if (cust.tab === 'mine') {
    body = <OrderList title="คิวของฉัน" orders={active} empty="ยังไม่มีคิวที่รออยู่ เลือกร้านจากหน้าแรกได้เลย" />;
  } else if (cust.tab === 'history') {
    const past = myOrders(orders).filter((o) => o.status === 'done' || o.status === 'cancelled');
    body = <OrderList title="ประวัติ" orders={past} empty="ยังไม่มีประวัติการสั่ง" />;
  } else if (cust.view === 'menu' && cust.stallId) {
    return <div className="screen"><StallMenu stallId={cust.stallId} /></div>;
  } else if (cust.view === 'checkout') {
    return <div className="screen"><Checkout /></div>;
  } else {
    body = <StallList orders={orders} />;
  }

  return (
    <>
      <div className="screen">{body}</div>
      <TabBar tab={cust.tab} activeCount={active.length} />
    </>
  );
}
