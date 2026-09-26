/** Статус исходящего сообщения */
export enum MessageStatusEnum {
  /** Уходит на сервер */
  PENDING = 'PENDING',
  /** Принято API */
  SENT = 'SENT',
  /** Доставлено */
  DELIVERED = 'DELIVERED',
  /** Прочитано */
  READ = 'READ',
  /** Ошибка отправки */
  FAILED = 'FAILED',
  /** На номере нет Telegram */
  NO_ACCOUNT = 'NO_ACCOUNT',
}
