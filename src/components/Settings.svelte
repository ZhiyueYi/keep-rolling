<script>
  import { settings } from './../store';

  let items;

  settings.subscribe(value => {
    items = value.rollingItems;
  });
</script>

<style>
  label {
    font-size: 1.4em;
  }
  .wrapper {
    display: flex;
    padding: 20px;
  }

  .list {
    width: 50%;
    text-align: left;
  }
</style>

<div class="wrapper">
  <div class="list">
    <label>Label</label>
    {#each items as item (item.label)}
      <input type="text" bind:value={item.label} />
    {/each}
  </div>
  <div class="list">
    <label>Probability</label>

    {#each items as item (item.label)}
      <input type="number" bind:value={item.probability} />
    {/each}
  </div>
</div>
