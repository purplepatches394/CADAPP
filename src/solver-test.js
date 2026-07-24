import { init_planegcs_module, GcsWrapper } from '@salusoft89/planegcs';

async function run() {
  const mod = await init_planegcs_module({
    locateFile: () => 'planegcs.wasm'
  });

  const gcs_system = new mod.GcsSystem();
  const gcs_wrapper = new GcsWrapper(gcs_system);

  // Point 1 is fixed at the origin. Point 2 starts at (5, 0) but we're
  // telling the solver it MUST end up exactly 50mm from point 1.
  const primitives = [
    { id: '1', type: 'point', x: 0, y: 0, fixed: true },
    { id: '2', type: 'point', x: 5, y: 0, fixed: false },
    { id: '3', type: 'p2p_distance', p1_id: '1', p2_id: '2', distance: 50 }
  ];

  gcs_wrapper.push_primitives_and_params(primitives);
  gcs_wrapper.solve();
  gcs_wrapper.apply_solution();

  const result = gcs_wrapper.sketch_index.get_primitives();
  document.getElementById('output').textContent = JSON.stringify(result, null, 2);
  console.log(result);
}

run();