export default {
  path: "/test",
  redirect: "/test/index",
  meta: {
    icon: "ri:information-line",
    // showLink: false,
    title: "测试页面",
    rank: 9
  },
  children: [
    {
      path: "/test/index",
      name: "Test",
      component: () => import("@/views/test/test.vue"),
      meta: {
        title: "测试页面目录",
        showParent: true
      }
    },
    {
      path: "/test/index2",
      name: "Test2",
      component: () => import("@/views/test/test2.vue"),
      meta: {
        title: "测试页面目录2",
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable;
