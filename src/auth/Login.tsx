import { useState, type FormEvent } from 'react';
import { DEMO_PIN, STALLS, stallLabel } from '../lib/data';
import { actions } from '../lib/store';
import { KuLogo, Nontri } from '../components/Brand';
import { Icon } from '../components/Icon';

type Mode = 'customer' | 'vendor';

/**
 * หน้าเข้าสู่ระบบ — แยกสองทางให้ชัดตั้งแต่แรก
 * นิสิต/บุคลากรใช้บัญชีนนทรีที่มีอยู่แล้ว ไม่ต้องสมัครใหม่
 * ร้านค้าเลือกเลขร้านแล้วกด PIN สี่หลัก เพราะแม่ค้าไม่ได้มีบัญชีมหาวิทยาลัย
 */
export function Login() {
  const [mode, setMode] = useState<Mode>('customer');

  return (
    <div className="login">
      {/* หัวจอชุดเดียวกับหน้าแรก ผู้ใช้จะเห็นหน้าตาเดียวกันตั้งแต่ก่อนเข้าสู่ระบบ */}
      <div className="topbar">
        <Nontri size={30} className="tb-flower f1" />
        <Nontri size={18} className="tb-flower f2" />
        <div className="tb-row">
          <KuLogo height={48} />
          <div className="grow">
            <div className="tb-hello">ต่อคิว</div>
            <div className="tb-loc"><Icon name="pin" size={15} weight={2.4} />โรงอาหาร มก. ศรีราชา</div>
          </div>
        </div>
      </div>

      <div className="login-hero">
        <h1>สั่งอาหารล่วงหน้า<br />ไม่ต้องยืนต่อแถว</h1>
        {/* รูปอาหารจริงวงกลมเรียงซ้อนกัน บอกว่าเป็นแอปสั่งอาหารโดยไม่แย่งที่โลโก้ */}
        <div className="foodstack" aria-hidden="true">
          {['kaprao', 'ntok', 'tamthai', 'kmg', 'tomyum'].map((d) => <img key={d} src={`/food/${d}.jpg`} alt="" />)}
          <span>{STALLS.length} ร้าน · {STALLS.reduce((n, st) => n + st.menu.length, 0)} เมนู</span>
        </div>
      </div>

      <div className="login-card">
        <div className="segment" role="tablist">
          <button role="tab" aria-selected={mode === 'customer'} onClick={() => setMode('customer')}>
            <Icon name="user" size={19} weight={2.2} />
            นิสิต / บุคลากร
          </button>
          <button role="tab" aria-selected={mode === 'vendor'} onClick={() => setMode('vendor')}>
            <Icon name="store" size={19} weight={2.2} />
            ร้านค้า
          </button>
        </div>

        {mode === 'customer' ? <CustomerForm /> : <VendorForm />}
      </div>

      <div className="login-foot">
        <Icon name="shield" size={16} weight={2.2} />
        <span>เวอร์ชันสาธิตสำหรับโรงอาหาร<br />มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตศรีราชา</span>
      </div>
    </div>
  );
}

function CustomerForm() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(actions.loginCustomer(account, password));
  }

  return (
    <form className="form" onSubmit={submit}>
      <label className="field">
        <span>บัญชีนนทรี หรือ รหัสนิสิต</span>
        <input
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="เช่น 6530xxxxxx"
          autoComplete="username"
          inputMode="text"
        />
      </label>
      <label className="field">
        <span>รหัสผ่าน</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="รหัสผ่านบัญชีนนทรี"
          autoComplete="current-password"
        />
      </label>

      {error && <div className="formerror" role="alert">{error}</div>}

      <button className="btn primary" type="submit">
        <Icon name="lock" size={19} weight={2.2} />
        เข้าสู่ระบบ
      </button>

      {/* ทางเลือกรองเป็นลิงก์บรรทัดเดียว หน้าจะได้พอดีจอโดยไม่ต้องเลื่อน */}
      <div className="altlinks">
        <button
          type="button"
          className="demo-fill"
          onClick={() => { setAccount('6530200123'); setPassword('demo'); setError(null); }}
        >
          ใช้บัญชีตัวอย่าง
        </button>
        <button type="button" className="demo-fill" onClick={() => actions.loginGuest()}>
          เข้าใช้แบบบุคคลทั่วไป
        </button>
      </div>
    </form>
  );
}

function VendorForm() {
  const [stallId, setStallId] = useState(STALLS[0]?.id ?? '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const stall = STALLS.find((s) => s.id === stallId);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(actions.loginVendor(stallId, pin));
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field">
        <span>เลือกเลขร้านของคุณ</span>
        <div className="stallpick">
          {STALLS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={s.id === stallId}
              aria-label={stallLabel(s) + ' ' + s.name}
              onClick={() => setStallId(s.id)}
            >
              <b className="num">{s.no}</b>
            </button>
          ))}
        </div>
        {stall && <div className="stallpick-name">{stallLabel(stall)} · {stall.name}</div>}
      </div>

      <label className="field">
        <span>PIN ร้าน 4 หลัก</span>
        <input
          className="pin num"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      </label>

      {error && <div className="formerror" role="alert">{error}</div>}

      <button className="btn primary" type="submit" disabled={pin.length < 4}>
        <Icon name="store" size={19} weight={2.2} />
        เข้าสู่ระบบร้าน
      </button>

      <button type="button" className="demo-fill" onClick={() => { setPin(DEMO_PIN); setError(null); }}>
        PIN สาธิต: {DEMO_PIN}
      </button>
    </form>
  );
}
