"use client";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { QRCodeSVG } from "qrcode.react";

interface ComandaProps {
  id: string;
  qrValue: string;
  numero: number;
}

export function Comanda({ id, qrValue, numero }: ComandaProps) {
  const { data } = useQuery<AxiosResponse>({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings"),
  });
  return (
    <div className="min-w-[7cm] flex min-h-[10cm] rounded-lg flex-col shadow-2xl overflow-hidden bg-white select-none cursor-pointer houver:scale-105 transition-all duration-300">
      {/* qr code */}
      <div className="flex items-center h-full justify-center">
        <QRCodeSVG size={180} value={qrValue} />
      </div>
      {/* Logo e numero da comanda */}
      <div className="flex h-full flex-1 items-end">
        <div className="flex  items-end pb-8 justify-center gap-6 bg-zinc-900 w-full h-36">
          <img src={data?.data.logo} alt="Logo" width={100} height={100} />
          <span className="font-bold text-white text-center text-5xl">
            {String(numero).padStart(3, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
