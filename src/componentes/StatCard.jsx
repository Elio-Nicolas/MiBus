/**
 * ==========================================================
 * Archivo: components/StatCard.jsx
 * ----------------------------------------------------------
 * Componente visual reutilizable para mostrar
 * una métrica del dashboard.
 *
 * Se utiliza para:
 * - Vueltas del día
 * - Promedio de vuelta
 * - Unidades activas
 *
 * Recibe:
 * title → nombre de la métrica
 * value → valor de la métrica
 * ==========================================================
 */

export default function StatCard({title, value}) {

  return (

    <div style={{
      border:"1px solid #ddd",
      padding:20,
      borderRadius:10,
      width:200,
      background:"#fafafa"
    }}>

      <h3>{title}</h3>

      <h1>{value}</h1>

    </div>

  );
}