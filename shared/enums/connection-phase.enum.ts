/** Фаза опроса уведомлений */
export enum ConnectionPhaseEnum {
  /** Опрос не запущен */
  IDLE = 'IDLE',
  /** Ждём уведомление */
  RECEIVING = 'RECEIVING',
  /** Записываем уведомление в стор */
  APPLYING = 'APPLYING',
  /** Подтверждаем получение */
  DELETING = 'DELETING',
  /** Пауза после временной ошибки */
  BACKOFF = 'BACKOFF',
  /** Опрос остановлен из-за постоянной ошибки */
  HALTED = 'HALTED',
}
