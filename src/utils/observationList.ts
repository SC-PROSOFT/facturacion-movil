/**
 * @file visitOrderOutcomeReasons.ts
 * @description Utilidades para gestionar las razones de resultados de visitas y pedidos.
 * Fecha de creación: 2025-05-19
 */

/**
 * @interface ReasonOption
 * @description Define la estructura para una opción de motivo.
 * @property {string} id - Identificador único para el motivo.
 * @property {string} label - Texto descriptivo del motivo para mostrar al usuario.
 * @property {string} [category] - (Opcional) Categoría a la que pertenece el motivo (cliente, vendedor, logístico, producto, etc.).
 */
export interface ReasonOption {
  id: string;
  label: string;
  category?:
    | 'cliente'
    | 'vendedor'
    | 'logistico'
    | 'producto_servicio'
    | 'administrativo'
    | 'tecnico'
    | 'externo'
    | 'otro';
}

// --- Lista 1: Motivos por los que se cancelaría una visita para hacer un pedido ---
// Estos motivos ocurren antes o al inicio de la visita, impidiendo que se realice.

export const CANCEL_VISIT_REASONS: ReasonOption[] = [
  {id: 'CV001', label: 'Cliente solicita reprogramación', category: 'cliente'},
  {
    id: 'CV002',
    label: 'Cliente no disponible / Local cerrado',
    category: 'cliente',
  },
  {
    id: 'CV003',
    label: 'Cliente canceló la cita previamente',
    category: 'cliente',
  },
  {
    id: 'CV004',
    label: 'Cliente ya no está interesado / No necesita el producto/servicio',
    category: 'cliente',
  },
  {
    id: 'CV005',
    label: 'Datos de contacto/dirección del cliente incorrectos',
    category: 'administrativo',
  },
  {
    id: 'CV006',
    label: 'Vendedor no disponible (enfermedad/emergencia)',
    category: 'vendedor',
  },
  {
    id: 'CV007',
    label: 'Problemas logísticos del vendedor (vehículo, tráfico, clima)',
    category: 'logistico',
  },
  {
    id: 'CV008',
    label: 'Error de programación o sistema',
    category: 'administrativo',
  },
  {
    id: 'CV009',
    label: 'Zona peligrosa / Problemas de orden público',
    category: 'externo',
  },
  {id: 'CV010', label: 'Cliente olvidó la cita', category: 'cliente'},
  {
    id: 'CV011',
    label: 'Decisión administrativa interna (empresa vendedora)',
    category: 'administrativo',
  },
  {id: 'CV999', label: 'Otro motivo (especificar)', category: 'otro'},
];

// --- Lista 2: Motivos por los que el vendedor no se encuentra cerca del cliente a la hora de hacer el pedido ---
// Estos motivos surgen si existe una validación de geolocalización para registrar el pedido.

export const NOT_NEAR_CLIENT_REASONS: ReasonOption[] = [
  //   {
  //     id: 'NC001',
  //     label: 'Problemas con el GPS del dispositivo móvil',
  //     category: 'tecnico',
  //   },
  {
    id: 'NC002',
    label: 'Ubicación del cliente registrada incorrectamente en el sistema',
    category: 'administrativo',
  },
  {
    id: 'NC003',
    label: 'Vendedor en una dirección errónea (confusión)',
    category: 'vendedor',
  },
  {
    id: 'NC004',
    label:
      'Intentando registrar fuera de la ubicación permitida (antes/después de la visita)',
    category: 'vendedor',
  },
  //   {
  //     id: 'NC005',
  //     label: 'Servicios de localización desactivados en el dispositivo',
  //     category: 'tecnico',
  //   },
  //   {
  //     id: 'NC006',
  //     label: 'Mala señal de red/GPS en la zona del cliente',
  //     category: 'externo',
  //   },
  //   {
  //     id: 'NC007',
  //     label: 'Geocerca del sistema demasiado restrictiva o mal configurada',
  //     category: 'tecnico',
  //   },
  {
    id: 'NC008',
    label:
      'Cliente atendido en un punto diferente al registrado (ej. feria, evento)',
    category: 'cliente',
  },
  {id: 'NC999', label: 'Otro motivo (especificar)', category: 'otro'},
];

// --- Lista 3: Motivos por los que se realiza la visita pero no se hace pedido ---
// Estos motivos ocurren después de que la visita se ha llevado a cabo.

export const NO_ORDER_AFTER_VISIT_REASONS: ReasonOption[] = [
  // Relacionados con el cliente
  {
    id: 'NV001',
    label: 'Cliente no tiene necesidad actual del producto/servicio',
    category: 'cliente',
  },
  {
    id: 'NV008',
    label: 'Cliente tiene stock suficiente / Compra reciente',
    category: 'cliente',
  },
  {
    id: 'NV002',
    label: 'Cliente no cuenta con presupuesto / Problemas de liquidez',
    category: 'cliente',
  },
  {
    id: 'NV003',
    label: 'Cliente prefiere productos/servicios de la competencia',
    category: 'cliente',
  },
  {
    id: 'NV004',
    label: 'Cliente no es el tomador de decisión / Requiere aprobación',
    category: 'cliente',
  },
  {
    id: 'NV005',
    label: 'Cliente no está de acuerdo con precios o condiciones comerciales',
    category: 'cliente',
  },
  //   {
  //     id: 'NV006',
  //     label: 'Cliente solicita más tiempo para evaluar la propuesta',
  //     category: 'cliente',
  //   },
  {
    id: 'NV007',
    label: 'Cliente solo requería información o cotización',
    category: 'cliente',
  },

  //   {
  //     id: 'NV009',
  //     label: 'Mala experiencia previa con la empresa/producto',
  //     category: 'cliente',
  //   },
  {
    id: 'NV010',
    label: 'Cliente cambió de proveedor recientemente',
    category: 'cliente',
  },
  {
    id: 'NV011',
    label: 'Cliente en proceso de cierre o cese de actividades',
    category: 'cliente',
  },

  // Relacionados con el producto/servicio o disponibilidad
  //   {
  //     id: 'NV020',
  //     label:
  //       'Producto/servicio no cumple con las expectativas/necesidades del cliente',
  //     category: 'producto_servicio',
  //   },
  {
    id: 'NV021',
    label: 'Producto(s) solicitado(s) no disponible(s) / Sin stock',
    category: 'producto_servicio',
  },
  //   {
  //     id: 'NV022',
  //     label: 'No se alcanza el monto o cantidad mínima para el pedido',
  //     category: 'administrativo',
  //   },
  //   {
  //     id: 'NV023',
  //     label: 'Condiciones de entrega no son favorables para el cliente',
  //     category: 'logistico',
  //   },
  {
    id: 'NV024',
    label: 'Falta de variedad o alternativas en el portafolio',
    category: 'producto_servicio',
  },

  // Relacionados con el proceso de venta o vendedor (menos comunes de auto-reportar, pero útiles para análisis)
  {
    id: 'NV030',
    label: 'No se pudo contactar al tomador de decisión durante la visita',
    category: 'cliente',
  },
  //   {
  //     id: 'NV031',
  //     label: 'Vendedor no contaba con información/muestras suficientes',
  //     category: 'vendedor',
  //   },

  // Relacionados con aspectos administrativos o técnicos durante la toma del pedido
  //   {
  //     id: 'NV040',
  //     label: 'Cliente no cumple con requisitos para crédito (si aplica)',
  //     category: 'administrativo',
  //   },
  {
    id: 'NV041',
    label:
      'Problemas técnicos con el dispositivo/aplicación para tomar el pedido',
    category: 'tecnico',
  },
  {
    id: 'NV042',
    label: 'Falta de documentación requerida por parte del cliente',
    category: 'cliente',
  },
  {id: 'NV999', label: 'Otro motivo (especificar)', category: 'otro'},
];
