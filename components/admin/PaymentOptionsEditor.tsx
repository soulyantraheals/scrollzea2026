"use client";

import { Input } from "@/components/ui/Input";

interface PaymentOption {
  provider: string;
  paymentUrl: string;
  enabled: boolean;
}

interface PaymentOptionsEditorProps {
  options: PaymentOption[];
  onChange: (options: PaymentOption[]) => void;
}

const providerLabels: Record<string, { name: string; placeholder: string }> = {
  RAZORPAY: { name: "Razorpay", placeholder: "https://rzp.io/..." },
  PAYPAL: { name: "PayPal", placeholder: "https://paypal.me/..." },
  WHATSAPP: { name: "WhatsApp", placeholder: "https://wa.me/91XXXXXXXXXX" },
};

export function PaymentOptionsEditor({ options, onChange }: PaymentOptionsEditorProps) {
  const updateOption = (index: number, field: string, value: any) => {
    onChange(options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  return (
    <div className="space-y-4">
      {options.map((opt, i) => {
        const info = providerLabels[opt.provider];
        return (
          <div key={opt.provider} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100">
            <label className="flex items-center gap-2 min-w-[100px]">
              <input
                type="checkbox"
                checked={opt.enabled}
                onChange={(e) => updateOption(i, "enabled", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">{info.name}</span>
            </label>
            <div className="flex-1">
              <Input
                placeholder={info.placeholder}
                value={opt.paymentUrl}
                onChange={(e) => updateOption(i, "paymentUrl", e.target.value)}
                disabled={!opt.enabled}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-500">
        Enable payment methods and enter the corresponding links. Any combination works.
      </p>
    </div>
  );
}
