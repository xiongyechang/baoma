# ref 和 reactive
- 用法见 /src/components/bottombar.vue

1. ref只可以监听简单数据，reactive可以监听所有数据
2. ref修改数据需要使用这样count.value=xxx的形式，而reactive只需要state.reactiveField=值这样来使用
3. 第二点体现在template中引用时候为reactiveField，不需要state，也就是说我reactive对象里面字段是应该直接使用的
4. 体现在reactive在return时候需要toRefs来转换成响应式对象
目前刚刚接触，我总结出的不同大概就这么些吧，我上面也提到了使用reactive需要用toRefs来包裹，那这个函数干嘛用的呢？
5. toRefs函数我是这么理解的 他能将reactive创建的响应式对象，转化成为普通的对象，并且这个对象上的每个节点，都是ref()类型的响应式数据。