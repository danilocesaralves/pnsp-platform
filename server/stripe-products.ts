// PNSP Stripe Products Configuration
// All prices in BRL (Brazilian Real)

export const PNSP_PRODUCTS = {
  // Studio Bookings - dynamic pricing via metadata
  STUDIO_BOOKING: {
    name: 'Reserva de Estúdio',
    description: 'Reserva de sala de estúdio ou ensaio na PNSP',
  },

  // Academy Premium Content
  ACADEMY_CONTENT: {
    name: 'Conteúdo Premium da Academia',
    description: 'Acesso a conteúdo educacional premium da Academia PNSP',
  },

  // Premium Offering Highlight
  OFFERING_HIGHLIGHT: {
    name: 'Destaque de Oferta Premium',
    description: 'Destaque sua oferta na PNSP por 30 dias',
    price: 4990, // R$ 49,90 in centavos
  },

  // Visibility Subscriptions
  SUBSCRIPTION_BASIC: {
    name: 'Assinatura PNSP Básica',
    description: 'Visibilidade aumentada, perfil verificado e acesso a recursos premium',
    price: 2990, // R$ 29,90/mês
  },

  SUBSCRIPTION_PRO: {
    name: 'Assinatura PNSP Pro',
    description: 'Visibilidade máxima, destaque no mapa, analytics e suporte prioritário',
    price: 7990, // R$ 79,90/mês
  },
} as const;
