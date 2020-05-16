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
    padding: 20px;
  }

  .grid {
    width: 50%;
    text-align: left;
    display: grid;
    grid-row-gap: 10px;
    grid-template-columns: auto auto auto;
  }

  .grid-item {
    padding: 10px;
  }

  .grid-title {
    font-size: 1.4em;
  }
</style>

<div class="wrapper">
  <h1>Settings</h1>
  <div class="grid">
    <div class="grid-item grid-title">Label</div>
    <div class="grid-item grid-title">Probability</div>
    <div class="grid-item grid-title">Action</div>
    {#each items as item, index (item.label)}
      <div class="grid-item">
        <input
          type="text"
          bind:value={item.label}
          placeholder="Enter a label" />
      </div>
      <div class="grid-item">
        <input
          type="number"
          bind:value={item.probability}
          placeholder="Enter probability weightage" />
      </div>
      <div class="grid-item">
        <button type="button" on:click={() => handleClickRemove(index)}>
          &times;
        </button>
      </div>
    {/each}
    <div class="grid-item">
      <input
        type="text"
        bind:value={newItem.label}
        placeholder="Enter a label" />
    </div>
    <div class="grid-item">
      <input
        type="number"
        bind:value={newItem.probability}
        placeholder="Enter probability weight" />
    </div>

    <div class="grid-item">
      <button type="button" on:click={handleClickAdd}>&plus;</button>
    </div>
  </div>
</div>
