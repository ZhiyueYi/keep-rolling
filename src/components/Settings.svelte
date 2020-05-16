<script>
  import { settings } from './../store';

  let items;
  let newItem = { label: '', probability: 0 };

  settings.subscribe(value => {
    items = value.rollingItems;
  });

  function handleClickAdd() {
    if (!newItem.label) {
      return;
    }

    settings.update(settings => ({
      ...settings,
      rollingItems: [...settings.rollingItems, newItem],
    }));
    newItem = { label: '', probability: 0 };
  }

  function handleClickRemove(index) {
    settings.update(settings => {
      const newItems = [...settings.rollingItems];
      newItems.splice(index, 1);
      return {
        ...settings,
        rollingItems: newItems,
      };
    });
  }
</script>

<style>
  .wrapper {
    margin: auto;
  }
</style>

<div class="wrapper">
  <div class="columns is-multiline">
    <div class="column is-full">
      <h1 class="title">Items</h1>
      <table
        class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
        <thead>
          <tr>
            <th>Label</th>
            <th>Probability</th>
            <th>Image</th>
            <th class="has-text-centered">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item, index (item.label)}
            <tr>
              <td>{item.label}</td>
              <td>{item.probability}</td>
              <td>{item.imgUrl || ''}</td>
              <td class="has-text-centered">
                <button
                  class="button is-small is-danger is-outlined"
                  type="button"
                  on:click={() => handleClickRemove(index)}>
                  &times;
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="column is-full">
      <h1 class="title">Add New</h1>
      <div class="columns">
        <div class="column">
          <input
            class="input"
            type="text"
            bind:value={newItem.label}
            placeholder="Enter a label" />
        </div>
        <div class="column">
          <input
            class="input"
            type="number"
            bind:value={newItem.probability}
            placeholder="Enter probability weight" />
        </div>
        <div class="column">
          <input
            class="input"
            type="text"
            bind:value={newItem.imgUrl}
            placeholder="Enter image URL (optional)" />
        </div>
        <div class="column has-text-right">
          <button
            class="button is-link is-outlined is-fullwidth"
            type="button"
            on:click={handleClickAdd}>
            &plus; Add
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
