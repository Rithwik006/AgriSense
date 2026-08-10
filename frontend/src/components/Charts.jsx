import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function CategoryChart({ categoryData = {} }) {
  const labels = Object.keys(categoryData);
  const dataValues = Object.values(categoryData);

  const data = {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Crops by Category',
        data: dataValues.length > 0 ? dataValues : [0],
        backgroundColor: [
          '#16a34a',
          '#0284c7',
          '#eab308',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export function StatusChart({ statusData = {} }) {
  const labels = Object.keys(statusData);
  const dataValues = Object.values(statusData);

  const data = {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [
      {
        label: 'Number of Crops',
        data: dataValues.length > 0 ? dataValues : [0],
        backgroundColor: '#22c55e',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return <Bar data={data} options={options} />;
}
