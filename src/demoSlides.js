// 6 demo slides based on real OK presentation content
export const DEMO_SLIDES = [
  {
    id: 1,
    layout: 'cover',
    data: {
      title: 'Одноклассники\nH1 2025',
      subtitle: 'Ключевые запуски и метрики',
    },
  },
  {
    id: 2,
    layout: 'stats',
    data: {
      title: 'Ключевые метрики платформы',
      metrics: [
        { value: '39,5', label: 'МЛН MAU', sublabel: '+2% г/г' },
        { value: '17,2', label: 'МЛН DAU', sublabel: '+3% г/г' },
        { value: '4,1×', label: 'Сессий/день', sublabel: 'среднее' },
        { value: '23 мин', label: 'Время в приложении', sublabel: '+8% г/г' },
        { value: '68%', label: 'Доля мобайл', sublabel: 'iOS + Android' },
        { value: '2,1×', label: 'Рост клипов', sublabel: 'MAU creators' },
      ],
    },
  },
  {
    id: 3,
    layout: 'three_cards',
    data: {
      title: 'Три стратегических приоритета',
      cards: [
        {
          icon: '🎬',
          title: 'Клипы и короткое видео',
          bullets: [
            'Фича-пэрити с конкурентами достигнут',
            'Новый алгоритм рекомендаций',
            'Монетизация авторов запущена',
            'Рост просмотров +180% г/г',
          ],
        },
        {
          icon: '🤝',
          title: 'Социальный граф',
          bullets: [
            'Обновлённая лента друзей',
            'Умные рекомендации подписок',
            'Групповой чат 2.0',
            'События и встречи',
          ],
        },
        {
          icon: '💰',
          title: 'Монетизация',
          bullets: [
            'Реклама в клипах',
            'Подписка ОК Премиум',
            'Виртуальные подарки',
            'ARPU +12% г/г',
          ],
        },
      ],
    },
  },
  {
    id: 4,
    layout: 'before_after',
    data: {
      title: 'Алгоритм ранжирования ленты',
      description: 'Перешли с правил-based модели на нейронную сеть с контекстными эмбеддингами. Учитывает историю взаимодействий и социальный граф.',
      before: 'Статические веса по типам контента. Decay-функция по времени. 12 признаков.',
      after: 'Двухстадийная модель: кандидаты + ранжирование. 400+ признаков. Онлайн-обучение.',
      metric: { value: '+0,3%', label: 'DAU' },
    },
  },
  {
    id: 5,
    layout: 'timeline',
    data: {
      title: 'Роадмап запусков H1 2025',
      points: [
        { label: 'Январь', value: 'Клипы 2.0', active: false },
        { label: 'Февраль', value: 'Чат-боты', active: false },
        { label: 'Март', value: 'Новая лента', active: true },
        { label: 'Апрель', value: 'AR-маски', active: false },
        { label: 'Май', value: 'Магазин', active: false },
        { label: 'Июнь', value: 'ТВ-сетка', active: false },
      ],
    },
  },
  {
    id: 6,
    layout: 'mockup',
    data: {
      title: 'Редизайн ленты рекомендаций',
      description: 'Новый интерфейс ленты с вертикальным скроллом клипов, бесшовным переходом между форматами и персонализированными блоками.',
      metric: { value: '+18%', label: 'Вовлечённость' },
    },
  },
]

export const LAYOUT_LABELS = {
  cover:        'Обложка',
  stats:        'Статистика',
  three_cards:  '3 карточки',
  before_after: 'Было / Стало',
  table:        'Таблица',
  timeline:     'Таймлайн',
  two_col:      '2 колонки',
  mockup:       'Мокап',
}
