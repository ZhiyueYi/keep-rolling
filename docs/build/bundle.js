
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.22.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const settings = writable({
      rollingItems: [
        {
          label: '1st Prize',
          probability: 10,
        },
        {
          label: '2nd Prize',
          probability: 20,
        },
        {
          label: '3rd Prize',
          probability: 30,
        },
        {
          label: 'Thank You',
          probability: 40,
        },
      ],
    });

    const rolling = writable(false);

    const activeItem = writable(0);

    function generateProbMap(rollingItems) {
      let accProb = 0;

      const probMap = rollingItems.map((item, index) => {
        const lower = accProb;
        const upper = accProb + item.probability;
        accProb = upper;

        return { lower, upper };
      }, {});

      return probMap;
    }

    function rollingWithProbMap(rollingItems, probMap) {
      const sum =
        rollingItems.reduce((sum, item) => sum + item.probability, 0) || 0;

      const score = Math.floor(Math.random() * sum);

      for (let i = 0; i < rollingItems.length; i++) {
        const { lower, upper } = probMap[i];

        if (score >= lower && score < upper) {
          return i;
        }
      }

      return rollingItems.length - 1;
    }

    /* src\components\Roller.svelte generated by Svelte v3.22.2 */
    const file = "src\\components\\Roller.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (45:2) {#each $settings.rollingItems as item, index (item.label)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let t_value = /*item*/ ctx[4].label + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "item svelte-19as197");
    			toggle_class(div, "active", /*$activeItem*/ ctx[1] === /*index*/ ctx[6]);
    			add_location(div, file, 45, 4, 1025);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$settings*/ 1 && t_value !== (t_value = /*item*/ ctx[4].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*$activeItem, $settings*/ 3) {
    				toggle_class(div, "active", /*$activeItem*/ ctx[1] === /*index*/ ctx[6]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:2) {#each $settings.rollingItems as item, index (item.label)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*$settings*/ ctx[0].rollingItems;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[4].label;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wrapper svelte-19as197");
    			add_location(div, file, 43, 0, 936);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$activeItem, $settings*/ 3) {
    				const each_value = /*$settings*/ ctx[0].rollingItems;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $settings;
    	let $activeItem;
    	validate_store(settings, "settings");
    	component_subscribe($$self, settings, $$value => $$invalidate(0, $settings = $$value));
    	validate_store(activeItem, "activeItem");
    	component_subscribe($$self, activeItem, $$value => $$invalidate(1, $activeItem = $$value));
    	let rollingInterval;
    	let probMap = [];

    	settings.subscribe(setting => {
    		probMap = generateProbMap(setting.rollingItems);
    	});

    	rolling.subscribe(isRolling => {
    		if (isRolling) {
    			rollingInterval = setInterval(
    				() => {
    					const activeIndex = rollingWithProbMap($settings.rollingItems, probMap);
    					activeItem.set(activeIndex);
    				},
    				50
    			);
    		} else {
    			clearInterval(rollingInterval);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Roller> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Roller", $$slots, []);

    	$$self.$capture_state = () => ({
    		settings,
    		rolling,
    		activeItem,
    		rollingWithProbMap,
    		generateProbMap,
    		rollingInterval,
    		probMap,
    		$settings,
    		$activeItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("rollingInterval" in $$props) rollingInterval = $$props.rollingInterval;
    		if ("probMap" in $$props) probMap = $$props.probMap;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$settings, $activeItem];
    }

    class Roller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Roller",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\Settings.svelte generated by Svelte v3.22.2 */
    const file$1 = "src\\components\\Settings.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[4] = list;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (29:4) {#each items as item (item.label)}
    function create_each_block_1(key_1, ctx) {
    	let input;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[1].call(input, /*item*/ ctx[3]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			add_location(input, file$1, 29, 6, 450);
    			this.first = input;
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*item*/ ctx[3].label);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", input_input_handler);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*items*/ 1 && input.value !== /*item*/ ctx[3].label) {
    				set_input_value(input, /*item*/ ctx[3].label);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(29:4) {#each items as item (item.label)}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#each items as item (item.label)}
    function create_each_block$1(key_1, ctx) {
    	let input;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[2].call(input, /*item*/ ctx[3]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			add_location(input, file$1, 36, 6, 622);
    			this.first = input;
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*item*/ ctx[3].probability);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", input_input_handler_1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*items*/ 1 && to_number(input.value) !== /*item*/ ctx[3].probability) {
    				set_input_value(input, /*item*/ ctx[3].probability);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(36:4) {#each items as item (item.label)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let label0;
    	let t1;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let each_value_1 = /*items*/ ctx[0];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*item*/ ctx[3].label;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*item*/ ctx[3].label;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Label";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Probability";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label0, "class", "svelte-1z0xsjg");
    			add_location(label0, file$1, 27, 4, 382);
    			attr_dev(div0, "class", "list svelte-1z0xsjg");
    			add_location(div0, file$1, 26, 2, 358);
    			attr_dev(label1, "class", "svelte-1z0xsjg");
    			add_location(label1, file$1, 33, 4, 546);
    			attr_dev(div1, "class", "list svelte-1z0xsjg");
    			add_location(div1, file$1, 32, 2, 522);
    			attr_dev(div2, "class", "wrapper svelte-1z0xsjg");
    			add_location(div2, file$1, 25, 0, 333);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*items*/ 1) {
    				const each_value_1 = /*items*/ ctx[0];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div0, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*items*/ 1) {
    				const each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div1, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let items;

    	settings.subscribe(value => {
    		$$invalidate(0, items = value.rollingItems);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Settings", $$slots, []);

    	function input_input_handler(item) {
    		item.label = this.value;
    		$$invalidate(0, items);
    	}

    	function input_input_handler_1(item) {
    		item.probability = to_number(this.value);
    		$$invalidate(0, items);
    	}

    	$$self.$capture_state = () => ({ settings, items });

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, input_input_handler, input_input_handler_1];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\Control.svelte generated by Svelte v3.22.2 */
    const file$2 = "src\\components\\Control.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Start";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Stop";
    			add_location(button0, file$2, 17, 2, 224);
    			add_location(button1, file$2, 18, 2, 278);
    			add_location(div, file$2, 16, 0, 215);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*handleClickStart*/ ctx[0], false, false, false),
    				listen_dev(button1, "click", /*handleClickStop*/ ctx[1], false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	function handleClickStart() {
    		rolling.set(true);
    	}

    	function handleClickStop() {
    		rolling.set(false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Control> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Control", $$slots, []);

    	$$self.$capture_state = () => ({
    		rolling,
    		handleClickStart,
    		handleClickStop
    	});

    	return [handleClickStart, handleClickStop];
    }

    class Control extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Control",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.22.2 */
    const file$3 = "src\\App.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let current;
    	const roller = new Roller({ $$inline: true });
    	const control = new Control({ $$inline: true });
    	const settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(roller.$$.fragment);
    			t0 = space();
    			create_component(control.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(settings.$$.fragment);
    			attr_dev(div0, "class", "roller svelte-1jy903t");
    			add_location(div0, file$3, 29, 2, 523);
    			attr_dev(div1, "class", "setting-panel svelte-1jy903t");
    			add_location(div1, file$3, 33, 2, 586);
    			attr_dev(main, "class", "svelte-1jy903t");
    			add_location(main, file$3, 28, 0, 514);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(roller, div0, null);
    			append_dev(div0, t0);
    			mount_component(control, div0, null);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			mount_component(settings, div1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(roller.$$.fragment, local);
    			transition_in(control.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(roller.$$.fragment, local);
    			transition_out(control.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(roller);
    			destroy_component(control);
    			destroy_component(settings);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Roller, Settings, Control });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
