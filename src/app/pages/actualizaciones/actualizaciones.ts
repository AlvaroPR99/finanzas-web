import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Version {
  numero: string;
  descripcion: string;
  cambios: string[];
}

@Component({
  selector: 'app-actualizaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actualizaciones.html',
  styleUrl: './actualizaciones.css',
})
export class ActualizacionesComponent {
  readonly versiones: Version[] = [
    {
      numero: 'v1.2',
      descripcion: 'Inversiones renovadas',
      cambios: [
        'Nueva tarjeta de "Dinero disponible" en el panel.',
        'Las inversiones previas ya no necesitan fecha.',
        'Nuevo tipo de registro "Aporte mensual" para sumar dinero a una inversión.',
        'Las inversiones se muestran arriba y los aportes se agrupan por mes.',
        'El monto de cada inversión incluye sus aportes.',
      ],
    },
  ];
}
