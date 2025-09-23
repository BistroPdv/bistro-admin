"use client";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import Image from "next/image";
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
    <div className="min-w-[7cm] flex min-h-[10cm] rounded-2xl flex-col shadow-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 select-none cursor-pointer hover:scale-105 hover:shadow-3xl transition-all duration-300 border border-gray-100">
      {/* Header com gradiente moderno */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-white font-semibold text-sm">
              {data?.data?.name}
            </span>
          </div>
        </div>
      </div>

      {/* QR Code com design moderno */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white relative">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl transform rotate-3"></div>
          <div className="relative bg-white p-4 rounded-2xl shadow-lg">
            <QRCodeSVG size={160} value={qrValue} level="M" />
          </div>
        </div>
      </div>

      {/* Footer com logo e número da mesa */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Image
                src={data?.data.logo}
                width={32}
                height={32}
                alt="Logo"
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">Comanda</p>
              <p className="text-white text-sm font-semibold">
                #{String(numero).padStart(3, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
