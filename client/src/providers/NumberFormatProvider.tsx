"use client";

import { useSystemSettings } from "@/hooks/useSystemSettings";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  DEFAULT_NUMBER_SETTINGS,
  VIETNAM_NUMBER_SETTINGS,
  getStoredNumberSettings,
  hasStoredNumberSettings,
  saveStoredNumberSettings,
  type NumberFormatSettings,
  type NumberFormatStyle,
} from "@/lib/formatters/numberConfig";
import {
  formatNumber as fnNumber,
  formatCurrency as fnCurrency,
  formatDimension as fnDimension,
  formatWeight as fnWeight,
  formatVolume as fnVolume,
  formatPercent as fnPercent,
  formatQuantity as fnQuantity,
  createInputNumberFormatter,
  createInputNumberParser,
} from "@/lib/formatters/numberFormatter";

export interface NumberFormatContextType {
  settings: NumberFormatSettings;
  updateSettings: (newSettings: Partial<NumberFormatSettings>) => void;
  switchStyle: (style: NumberFormatStyle) => void;
  resetSettings: () => void;
  // Các hàm format tiện ích ràng buộc trực tiếp với settings hiện tại
  formatNumber: (val: number | string | null | undefined, decimals?: number, keepTrailingZeros?: boolean) => string;
  formatCurrency: (val: number | string | null | undefined, symbol?: string, decimals?: number) => string;
  formatDimension: (val: number | string | null | undefined, unit?: string, decimals?: number) => string;
  formatWeight: (val: number | string | null | undefined, unit?: string, decimals?: number) => string;
  formatVolume: (val: number | string | null | undefined, unit?: string, decimals?: number) => string;
  formatPercent: (val: number | string | null | undefined, decimals?: number) => string;
  formatQuantity: (val: number | string | null | undefined, unit?: string, decimals?: number) => string;
  // Formatter & Parser cho Ant Design InputNumber
  inputFormatter: (val: number | string | undefined) => string;
  inputParser: (val: string | undefined) => number;
}

const NumberFormatContext = createContext<NumberFormatContextType | null>(null);

export function NumberFormatProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NumberFormatSettings>(DEFAULT_NUMBER_SETTINGS);

  // Đọc từ LocalStorage khi mount client; user chưa tự chọn -> theo "Định dạng số mặc định" của Cấu hình hệ thống
  const { numberFormat, isLoaded } = useSystemSettings();
  useEffect(() => {
    const systemDefault = numberFormat === "VN" ? VIETNAM_NUMBER_SETTINGS : DEFAULT_NUMBER_SETTINGS;
    setSettings(hasStoredNumberSettings() ? getStoredNumberSettings() : systemDefault); // eslint-disable-line react-hooks/set-state-in-effect
  }, [numberFormat, isLoaded]);

  const updateSettings = useCallback((newSettings: Partial<NumberFormatSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      saveStoredNumberSettings(merged);
      return merged;
    });
  }, []);

  const switchStyle = useCallback((style: NumberFormatStyle) => {
    const base = style === "vietnam" ? VIETNAM_NUMBER_SETTINGS : DEFAULT_NUMBER_SETTINGS;
    setSettings(base);
    saveStoredNumberSettings(base);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_NUMBER_SETTINGS);
    saveStoredNumberSettings(DEFAULT_NUMBER_SETTINGS);
  }, []);

  // Bind các hàm format với settings hiện tại
  const contextValue: NumberFormatContextType = useMemo(() => {
    return {
      settings,
      updateSettings,
      switchStyle,
      resetSettings,
      formatNumber: (val, decimals, keepTrailingZeros) =>
        fnNumber(val, { decimals, settings, keepTrailingZeros }),
      formatCurrency: (val, symbol, decimals) =>
        fnCurrency(val, { symbol, decimals, settings }),
      formatDimension: (val, unit, decimals) =>
        fnDimension(val, { unit, decimals, settings }),
      formatWeight: (val, unit, decimals) =>
        fnWeight(val, { unit, decimals, settings }),
      formatVolume: (val, unit, decimals) =>
        fnVolume(val, { unit, decimals, settings }),
      formatPercent: (val, decimals) =>
        fnPercent(val, { decimals, settings }),
      formatQuantity: (val, unit, decimals) =>
        fnQuantity(val, { unit, decimals, settings }),
      inputFormatter: createInputNumberFormatter(settings),
      inputParser: createInputNumberParser(settings),
    };
  }, [settings, updateSettings, switchStyle, resetSettings]);

  return (
    <NumberFormatContext.Provider value={contextValue}>
      {children}
    </NumberFormatContext.Provider>
  );
}

export function useNumberFormat(): NumberFormatContextType {
  const context = useContext(NumberFormatContext);
  if (!context) {
    // Fallback an toàn nếu component được render ngoài Provider
    return {
      settings: DEFAULT_NUMBER_SETTINGS,
      updateSettings: () => {},
      switchStyle: () => {},
      resetSettings: () => {},
      formatNumber: (val, decimals, keepTrailingZeros) =>
        fnNumber(val, { decimals, settings: DEFAULT_NUMBER_SETTINGS, keepTrailingZeros }),
      formatCurrency: (val, symbol, decimals) =>
        fnCurrency(val, { symbol, decimals, settings: DEFAULT_NUMBER_SETTINGS }),
      formatDimension: (val, unit, decimals) =>
        fnDimension(val, { unit, decimals, settings: DEFAULT_NUMBER_SETTINGS }),
      formatWeight: (val, unit, decimals) =>
        fnWeight(val, { unit, decimals, settings: DEFAULT_NUMBER_SETTINGS }),
      formatVolume: (val, unit, decimals) =>
        fnVolume(val, { unit, decimals, settings: DEFAULT_NUMBER_SETTINGS }),
      formatPercent: (val, decimals) =>
        fnPercent(val, { decimals, settings: DEFAULT_NUMBER_SETTINGS }),
      formatQuantity: (val, unit, decimals) =>
        fnQuantity(val, { unit, decimals, settings: DEFAULT_NUMBER_SETTINGS }),
      inputFormatter: createInputNumberFormatter(DEFAULT_NUMBER_SETTINGS),
      inputParser: createInputNumberParser(DEFAULT_NUMBER_SETTINGS),
    };
  }
  return context;
}
