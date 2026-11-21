import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { STATUSES, STATUS_COLORS } from './constants';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);
ChartJS.defaults.font.family = '"Plus Jakarta Sans", system-ui, sans-serif';
ChartJS.defaults.color = '#64748B';

export { STATUSES, STATUS_COLORS };
