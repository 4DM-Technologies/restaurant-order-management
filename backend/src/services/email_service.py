"""Bill email — mock adapter (console) or real SMTP (Gmail App Password)."""

import html
import smtplib
from email.message import EmailMessage

from src.settings import settings
from src.utils.logger import logged, logger

_BRAND = "Soroco House"


def _p(items: list[dict]) -> str:
    return "\n".join(
        f"{it['quantity']} x {it['item_name']}"
        + (f" ({it['selected_size']})" if it.get("selected_size") else "")
        + f"  ₹{it['line_total']:.2f}"
        for it in items
    )


_TAX_LABEL = "GST (5%)"


def build_bill_body(
    order_number: int,
    items: list[dict],
    subtotal: float,
    tax: float,
    total: float,
    payment_method: str,
    table_name: str,
    customer_name: str,
) -> str:
    return "\n".join(
        [
            f"Hi {customer_name},",
            f"Thank you for ordering at {settings.app_name}!",
            "",
            f"Order #{order_number}  ·  Table {table_name}",
            "--------------------------------",
            _p(items),
            "--------------------------------",
            f"Item total: ₹{subtotal:.2f}",
            f"{_TAX_LABEL}: ₹{tax:.2f}",
            f"Total: ₹{total:.2f}",
            f"Paid via {payment_method}",
            "",
            "Your order is now in the kitchen and will be served shortly.",
            f"— {_BRAND}",
        ]
    )


def _amount(value: float) -> str:
    return f"₹{value:,.2f}"


def build_bill_html(
    order_number: int,
    items: list[dict],
    subtotal: float,
    tax: float,
    total: float,
    payment_method: str,
    table_name: str,
    customer_name: str,
) -> str:
    brand = _BRAND
    customer = html.escape(customer_name or "Guest")
    table = html.escape(table_name)
    method = html.escape(payment_method.upper())

    rows = []
    for it in items:
        size = (
            html.escape(str(it["selected_size"])) if it.get("selected_size") else None
        )
        name = html.escape(it["item_name"])
        qty = int(it["quantity"])
        detail = f"{size} · ×{qty}" if size else f"×{qty}"
        rows.append(
            f"""
        <tr>
          <td style="padding:12px 0;border-top:1px solid #F0E9DD;">
            <div style="color:#2B1E16;font-size:15px;font-weight:600;">{name}</div>
            <div style="color:#9B8B78;font-size:13px;margin-top:2px;">{detail}</div>
          </td>
          <td style="padding:12px 0;border-top:1px solid #F0E9DD;color:#2B1E16;font-size:15px;font-weight:600;text-align:right;white-space:nowrap;">
            {_amount(it["line_total"])}
          </td>
        </tr>"""
        )

    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order confirmed</title></head>
<body style="margin:0;padding:0;background:#F5F1EA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1EA;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #EDE4D3;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <div style="color:#A0653A;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;text-align:center;">{brand}</div>
              <div style="color:#2B1E16;font-size:22px;font-weight:700;text-align:center;margin:14px 0 4px 0;letter-spacing:-0.3px;">
                Thanks, {customer}!
              </div>
              <div style="color:#9B8B78;font-size:14px;text-align:center;line-height:1.5;">
                Your order is in the kitchen and will be served shortly. Thanks for choosing {brand}!
              </div>
              <div style="text-align:center;margin-top:14px;">
                <span style="display:inline-block;background:#F0EAE0;color:#6B5028;font-size:13px;font-weight:700;border-radius:999px;padding:6px 16px;">
                  Order #{order_number}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#FAF6EF;border-radius:10px;padding:12px 16px;">
                    <div style="color:#9B8B78;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Table</div>
                    <div style="color:#2B1E16;font-size:15px;font-weight:600;margin-top:3px;">{table}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 6px 0;color:#9B8B78;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Item</td>
                  <td align="right" style="padding:0 0 6px 0;color:#9B8B78;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Amount</td>
                </tr>
                {"".join(rows)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#655A4C;font-size:14px;padding:5px 0;">Item total</td>
                  <td align="right" style="color:#2B1E16;font-size:14px;padding:5px 0;">{_amount(subtotal)}</td>
                </tr>
                <tr>
                  <td style="color:#655A4C;font-size:14px;padding:5px 0;">{_TAX_LABEL}</td>
                  <td align="right" style="color:#2B1E16;font-size:14px;padding:5px 0;">{_amount(tax)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:2px solid #2B1E16;padding:0;line-height:0;font-size:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="color:#2B1E16;font-size:16px;font-weight:700;padding:14px 0 0 0;">Total</td>
                  <td align="right" style="color:#2B1E16;font-size:22px;font-weight:700;letter-spacing:-0.3px;padding:14px 0 0 0;">{_amount(total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 8px 40px;">
              <div style="display:inline-block;background:#F0EAE0;color:#6B5028;font-size:12px;font-weight:600;border-radius:999px;padding:8px 16px;">
                Paid via {method}
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #F0E9DD;margin-top:24px;padding:20px 40px 30px 40px;text-align:center;">
              <div style="color:#2B1E16;font-size:13px;font-weight:700;">{brand}</div>
              <div style="color:#9B8B78;font-size:13px;margin-top:4px;">We brew joy, one cup at a time.</div>
              <div style="color:#C7B7A3;font-size:12px;margin-top:12px;">This is an automated order confirmation.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _subject(order_number: int) -> str:
    return f"Order #{order_number} confirmed — {_BRAND}"


@logged(workflow="bill-email")
def send_bill(
    to_email: str,
    *,
    order_number: int,
    items: list[dict],
    subtotal: float,
    tax: float,
    total: float,
    payment_method: str,
    table_name: str,
    customer_name: str,
) -> bool:
    if not to_email:
        logger.info("No customer email provided — skipping bill email.")
        return False

    body = build_bill_body(
        order_number,
        items,
        subtotal,
        tax,
        total,
        payment_method,
        table_name,
        customer_name,
    )
    html_body = build_bill_html(
        order_number,
        items,
        subtotal,
        tax,
        total,
        payment_method,
        table_name,
        customer_name,
    )

    if settings.email_mock:
        logger.info("[email-mock] would email %s:\n%s", to_email, body)
        return True

    try:
        msg = EmailMessage()
        msg["Subject"] = _subject(order_number)
        msg["From"] = settings.smtp_sender
        msg["To"] = to_email
        msg.set_content(body)
        msg.add_alternative(html_body, subtype="html")
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as smtp:
            smtp.starttls()
            smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
        logger.info("Bill email sent to %s", to_email)
        return True
    except Exception:  # noqa: BLE001
        logger.exception("Bill email failed")
        return False
