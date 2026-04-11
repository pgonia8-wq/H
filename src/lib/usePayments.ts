// usePayments.ts
// CORRECCIÓN F6: Este hook NO procesa pagos reales.
// Todos los pagos deben hacerse vía MiniKit.commandsAsync.pay() y luego
// verificarse con /api/verifyPayment en el backend.
// Este hook queda como utilidad de registro auxiliar SOLO si el pago
// ya fue verificado por el backend. Si se llama sin verificación previa,
// lanza un error para evitar registros falsos.

export const usePayments = () => {
  const handlePayment = async (
    _label: string,
    _amount: number,
    _userId: string
  ): Promise<never> => {
    throw new Error(
      "[usePayments] No usar directamente. Usa MiniKit.commandsAsync.pay() " +
      "y verifica con /api/verifyPayment antes de registrar el pago."
    );
  };

  return { handlePayment };
};
