/**
 * Interface que representa o modelo de notificação.
 *
 * @interface NotificationModel
 */
export interface NotificationModel {
  /** Mensagem da notificação */
  message: string;

  /** Tipo da notificação, que pode ser 'success', 'info', 'warn' ou 'error' */
  type: NotificationType;
}

/**
 * Tipo que define os diferentes tipos de notificação.
 *
 * @type NotificationType
 * @memberof NotificationModel
 */
export type NotificationType = 'success' | 'info' | 'warn' | 'error';
