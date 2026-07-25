import { init_planegcs_module, GcsWrapper } from '@salusoft89/planegcs';

let modPromise = null;

function getModule() {
  if (!modPromise) {
    modPromise = init_planegcs_module({ locateFile: () => 'planegcs.wasm' });
  }
  return modPromise;
}

// Given a fixed point (x1,y1) and a movable point currently at (x2,y2),
// returns where the movable point must go so it's exactly `newDistance`
// away from the fixed point — calculated by the real constraint solver.
export async function solveLineLength(x1, y1, x2, y2, newDistance) {
  const mod = await getModule();
  const gcs_system = new mod.GcsSystem();
  const gcs_wrapper = new GcsWrapper(gcs_system);

  const primitives = [
    { id: 'p1', type: 'point', x: x1, y: y1, fixed: true },
    { id: 'p2', type: 'point', x: x2, y: y2, fixed: false },
    { id: 'd', type: 'p2p_distance', p1_id: 'p1', p2_id: 'p2', distance: newDistance }
  ];

  gcs_wrapper.push_primitives_and_params(primitives);
  gcs_wrapper.solve();
  gcs_wrapper.apply_solution();

  const result = gcs_wrapper.sketch_index.get_primitives();
  const movedPoint = result.find(p => p.id === 'p2');

  gcs_wrapper.destroy_gcs_module();
  return { x: movedPoint.x, y: movedPoint.y };
}