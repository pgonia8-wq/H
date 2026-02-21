export function handlePayment(label: string) {
  // Genera un ID único para cada pago
  const paymentId = `${label.toLowerCase()}-${Date.now()}`
  console.log('Payment ID:', paymentId)

  // Aquí puedes integrar MiniKit o World ID si lo necesitas
  // Ejemplo:
  // await miniKit.createPayment({ id: paymentId, amount: 100, token: 'WLD' })

  return paymentId
}
