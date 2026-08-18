import type { SupportedLocale } from './translations';

export type FinancialTranslationKey =
  | 'walletTitle'
  | 'walletSubtitle'
  | 'availableBalance'
  | 'pendingBalance'
  | 'reservedBalance'
  | 'topUp'
  | 'topUpAmount'
  | 'topUpStarted'
  | 'topUpFailed'
  | 'withdraw'
  | 'sendMoney'
  | 'remittance'
  | 'transactions'
  | 'completePayment'
  | 'invalidAmount'
  | 'insufficientFunds'
  | 'walletPin'
  | 'setPin'
  | 'recipientPhone'
  | 'payoutMethod'
  | 'fxRate'
  | 'totalDebit'
  | 'recipientReceives'
  | 'estimatedDelivery'
  | 'airtime'
  | 'buyData'
  | 'payElectricity'
  | 'payBills'
  | 'buyVoucher'
  | 'financialOverview'
  | 'reconciliation'
  | 'settlement'
  | 'frozenAccounts'
  | 'riskAlerts'
  | 'transferSuccess'
  | 'withdrawalPending'
  | 'kycRequired'
  | 'featureUnavailable'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'processing'
  | 'fee'
  | 'confirm'
  | 'cancel';

const TABLE: Record<SupportedLocale, Record<FinancialTranslationKey, string>> = {
  en: {
    walletTitle: 'Kudya Wallet',
    walletSubtitle: 'Your balance, transfers & payments',
    availableBalance: 'Available balance',
    pendingBalance: 'Pending balance',
    reservedBalance: 'Reserved balance',
    topUp: 'Add money',
    topUpAmount: 'Amount to add',
    topUpStarted: 'Top-up started — complete payment to credit your wallet.',
    topUpFailed: 'Top-up failed. Please try again.',
    withdraw: 'Withdraw',
    sendMoney: 'Send money',
    remittance: 'International transfer',
    transactions: 'Transactions',
    completePayment: 'Complete payment',
    invalidAmount: 'Enter a valid amount.',
    insufficientFunds: 'Insufficient balance.',
    walletPin: 'Wallet PIN',
    setPin: 'Set wallet PIN',
    recipientPhone: 'Recipient phone',
    payoutMethod: 'Payout method',
    fxRate: 'Exchange rate',
    totalDebit: 'Total debit',
    recipientReceives: 'Recipient receives',
    estimatedDelivery: 'Estimated delivery',
    airtime: 'Buy airtime',
    buyData: 'Buy data',
    payElectricity: 'Pay electricity',
    payBills: 'Pay bills',
    buyVoucher: 'Buy voucher',
    financialOverview: 'Financial overview',
    reconciliation: 'Reconciliation',
    settlement: 'Settlement',
    frozenAccounts: 'Frozen accounts',
    riskAlerts: 'Risk alerts',
    transferSuccess: 'Transfer completed successfully.',
    withdrawalPending: 'Withdrawal is being processed.',
    kycRequired: 'Verify your identity to unlock this feature.',
    featureUnavailable: 'This feature is not available in your country yet.',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    processing: 'Processing',
    fee: 'Fee',
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
  pt: {
    walletTitle: 'Carteira Kudya',
    walletSubtitle: 'Saldo, transferências e pagamentos',
    availableBalance: 'Saldo disponível',
    pendingBalance: 'Saldo pendente',
    reservedBalance: 'Saldo reservado',
    topUp: 'Adicionar dinheiro',
    topUpAmount: 'Valor a adicionar',
    topUpStarted: 'Carregamento iniciado — conclua o pagamento para creditar a carteira.',
    topUpFailed: 'Falha no carregamento. Tente novamente.',
    withdraw: 'Levantar',
    sendMoney: 'Enviar dinheiro',
    remittance: 'Transferência internacional',
    transactions: 'Transações',
    completePayment: 'Concluir pagamento',
    invalidAmount: 'Introduza um valor válido.',
    insufficientFunds: 'Saldo insuficiente.',
    walletPin: 'PIN da carteira',
    setPin: 'Definir PIN da carteira',
    recipientPhone: 'Telefone do destinatário',
    payoutMethod: 'Método de pagamento',
    fxRate: 'Taxa de câmbio',
    totalDebit: 'Débito total',
    recipientReceives: 'Destinatário recebe',
    estimatedDelivery: 'Entrega estimada',
    airtime: 'Comprar crédito',
    buyData: 'Comprar dados',
    payElectricity: 'Pagar eletricidade',
    payBills: 'Pagar contas',
    buyVoucher: 'Comprar voucher',
    financialOverview: 'Visão financeira',
    reconciliation: 'Reconciliação',
    settlement: 'Liquidação',
    frozenAccounts: 'Contas congeladas',
    riskAlerts: 'Alertas de risco',
    transferSuccess: 'Transferência concluída com sucesso.',
    withdrawalPending: 'Levantamento em processamento.',
    kycRequired: 'Verifique a sua identidade para desbloquear esta funcionalidade.',
    featureUnavailable: 'Esta funcionalidade ainda não está disponível no seu país.',
    pending: 'Pendente',
    completed: 'Concluído',
    failed: 'Falhou',
    processing: 'A processar',
    fee: 'Taxa',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
  fr: {
    walletTitle: 'Portefeuille Kudya',
    walletSubtitle: 'Solde, transferts et paiements',
    availableBalance: 'Solde disponible',
    pendingBalance: 'Solde en attente',
    reservedBalance: 'Solde réservé',
    topUp: 'Ajouter de l\'argent',
    topUpAmount: 'Montant à ajouter',
    topUpStarted: 'Rechargement lancé — finalisez le paiement pour créditer votre portefeuille.',
    topUpFailed: 'Échec du rechargement. Veuillez réessayer.',
    withdraw: 'Retirer',
    sendMoney: 'Envoyer de l\'argent',
    remittance: 'Transfert international',
    transactions: 'Transactions',
    completePayment: 'Finaliser le paiement',
    invalidAmount: 'Entrez un montant valide.',
    insufficientFunds: 'Solde insuffisant.',
    walletPin: 'Code PIN du portefeuille',
    setPin: 'Définir le code PIN',
    recipientPhone: 'Téléphone du destinataire',
    payoutMethod: 'Mode de paiement',
    fxRate: 'Taux de change',
    totalDebit: 'Débit total',
    recipientReceives: 'Le destinataire reçoit',
    estimatedDelivery: 'Délai estimé',
    airtime: 'Acheter du crédit',
    buyData: 'Acheter des données',
    payElectricity: 'Payer l\'électricité',
    payBills: 'Payer des factures',
    buyVoucher: 'Acheter un bon',
    financialOverview: 'Aperçu financier',
    reconciliation: 'Rapprochement',
    settlement: 'Règlement',
    frozenAccounts: 'Comptes gelés',
    riskAlerts: 'Alertes de risque',
    transferSuccess: 'Transfert effectué avec succès.',
    withdrawalPending: 'Retrait en cours de traitement.',
    kycRequired: 'Vérifiez votre identité pour débloquer cette fonctionnalité.',
    featureUnavailable: 'Cette fonctionnalité n\'est pas encore disponible dans votre pays.',
    pending: 'En attente',
    completed: 'Terminé',
    failed: 'Échoué',
    processing: 'En cours',
    fee: 'Frais',
    confirm: 'Confirmer',
    cancel: 'Annuler',
  },
  es: {
    walletTitle: 'Cartera Kudya',
    walletSubtitle: 'Saldo, transferencias y pagos',
    availableBalance: 'Saldo disponible',
    pendingBalance: 'Saldo pendiente',
    reservedBalance: 'Saldo reservado',
    topUp: 'Añadir dinero',
    topUpAmount: 'Importe a añadir',
    topUpStarted: 'Recarga iniciada — complete el pago para acreditar su cartera.',
    topUpFailed: 'Error en la recarga. Inténtelo de nuevo.',
    withdraw: 'Retirar',
    sendMoney: 'Enviar dinero',
    remittance: 'Transferencia internacional',
    transactions: 'Transacciones',
    completePayment: 'Completar pago',
    invalidAmount: 'Introduzca un importe válido.',
    insufficientFunds: 'Saldo insuficiente.',
    walletPin: 'PIN de cartera',
    setPin: 'Establecer PIN',
    recipientPhone: 'Teléfono del destinatario',
    payoutMethod: 'Método de pago',
    fxRate: 'Tipo de cambio',
    totalDebit: 'Débito total',
    recipientReceives: 'El destinatario recibe',
    estimatedDelivery: 'Entrega estimada',
    airtime: 'Comprar saldo',
    buyData: 'Comprar datos',
    payElectricity: 'Pagar electricidad',
    payBills: 'Pagar facturas',
    buyVoucher: 'Comprar voucher',
    financialOverview: 'Resumen financiero',
    reconciliation: 'Reconciliación',
    settlement: 'Liquidación',
    frozenAccounts: 'Cuentas congeladas',
    riskAlerts: 'Alertas de riesgo',
    transferSuccess: 'Transferencia completada con éxito.',
    withdrawalPending: 'Retiro en procesamiento.',
    kycRequired: 'Verifique su identidad para desbloquear esta función.',
    featureUnavailable: 'Esta función aún no está disponible en su país.',
    pending: 'Pendiente',
    completed: 'Completado',
    failed: 'Fallido',
    processing: 'Procesando',
    fee: 'Comisión',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
};

export function financialT(locale: SupportedLocale, key: string): string | undefined {
  const table = TABLE[locale] as Record<string, string> | undefined;
  if (table?.[key]) return table[key];
  return TABLE.en[key as FinancialTranslationKey];
}
