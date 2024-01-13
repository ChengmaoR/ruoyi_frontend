<template>
  <div class="app-container search-table-box aidex-table">
    <el-card
      shadow="never"
      ref="queryRef"
      style="margin-bottom: 12px"
      class="search_card"
      v-show="showSearch"
    >
      <div class="filter-container">
        <div class="search_box">
          <el-form :model="queryParams" ref="queryForm" label-width="80px">
            <el-row :gutter="16">
              <el-col :md="6">
                <el-form-item label="品类名称" prop="name">
                  <el-input
                    v-model="queryParams.name"
                    placeholder="请输入品类名称"
                    clearable
                    @keyup.enter="handleQuery"
                  />
                </el-form-item>
              </el-col>
              <el-col :md="6" align="right" style="margin-left: auto">
                <el-form-item class="search_btn_box">
                  <el-button
                    class="filter-item"
                    type="primary"
                    @click="handleQuery"
                    >搜索</el-button
                  >
                  <el-button
                    class="filter-item"
                    style="margin-left: 8px"
                    @click="resetQuery"
                    >重置</el-button
                  >
                  <a
                    @click="toggleAdvanced"
                    style="margin: 0 4px 0 8px; vertical-align: middle"
                  >
                    {{ advanced ? "收起" : "展开" }}
                    <el-icon v-if="!advanced"><ArrowDown /></el-icon>
                    <el-icon v-if="advanced"><ArrowUp /></el-icon>
                  </a>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <el-row>
          <el-col :span="8">
            <div class="card-header">
              <el-button disabled type="text">品类信息</el-button>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="btn_box" align="right" style="float: right">
              <el-button
                class="filter-item"
                style="margin-left: 8px"
                type="primary"
                icon="Plus"
                @click="handleAdd"
                v-hasPermi="['system:robot:add']"
                >新增</el-button
              >
              <el-button
                class="filter-item"
                style="margin-left: 8px"
                type="danger"
                icon="Delete"
                v-if="!multiple"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['system:robot:remove']"
                >删除</el-button
              >
              <el-button
                class="filter-item"
                style="margin-left: 8px"
                type="warning"
                icon="Download"
                @click="handleExport"
                v-hasPermi="['system:robot:export']"
                >导出</el-button
              >
              <right-toolbar
                v-model:showSearch="showSearch"
                @queryTable="getList"
              ></right-toolbar>
            </div>
          </el-col>
        </el-row>
      </template>

      <el-table
        stripe
        ref="tableRef"
        v-loading="loading"
        :data="robotList"
        @selection-change="handleSelectionChange"
        highlight-current-row
        style="width: 100%"
        :height="tableHeight"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="品类名称" align="center" prop="name" />
        <el-table-column label="封面" align="center" prop="url">
          <template #default="scope">
            <div>
              <el-image
                style="width: 100px; height: 100px"
                :src="url + scope.row.url"
                fit="cover"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="type">
          <template #default="scope">
            <dict-tag :options="code_type" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="溯源码数量" align="center" prop="nums" />
        <el-table-column label="已经生成的码" align="center" prop="hasNums" />
        <el-table-column label="机器人" align="center" prop="robotId" />
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="300"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button type="text" @click="handleMake(scope.row)"
              >生成</el-button
            >
            <router-link
              type="link"
              key="expand"
              class="sidebar-logo-link"
              :to="`/traceability/code?id=` + scope.row.id"
              ><el-button type="text">查看码</el-button></router-link
            >
            <el-button
              type="text"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:robot:edit']"
              >修改</el-button
            >
            <el-button
              type="text"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:robot:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column>
        <template v-slot:empty>
          <svg-icon icon-class="search-none" style="font-size: 64px" />
          <p>暂无数据</p>
        </template>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />

      <!-- 添加或修改品类对话框 -->
      <el-dialog :title="title" v-model="open" width="720px" append-to-body>
        <div class="dialog_box" style="height: 500px">
          <el-form
            ref="robotRef"
            :model="form"
            :rules="rules"
            label-position="top"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="品类名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入品类名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="类型" prop="type">
                  <el-select
                    v-model="form.type"
                    placeholder="请选择类型"
                    clearable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="dict in code_type"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="溯源码数量" prop="nums">
                  <el-input
                    v-model="form.nums"
                    placeholder="请输入溯源码数量"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机器人" prop="robotId">
                  <el-input v-model="form.robotId" placeholder="请输入机器人" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="封面" prop="url">
                  <ImageUpload v-model="form.url"></ImageUpload>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup name="Robot">
import {
  listRobot,
  getRobot,
  delRobot,
  addRobot,
  updateRobot,
  makeCode,
} from "@/api/system/robot";

const { proxy } = getCurrentInstance();
const { code_type } = proxy.useDict("code_type");
const url = import.meta.env.VITE_APP_BASE_API;

const advanced = ref(false);
let tableHeight = proxy.getInitTableHeight();
const robotList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    type: null,
    nums: null,
    hasNums: null,
    robotId: null,
  },
  rules: {
    name: [{ required: true, message: "品类名称不能为空", trigger: "blur" }],
    type: [{ required: true, message: "类型不能为空", trigger: "blur" }],
    nums: [{ required: true, message: "溯源码数量不能为空", trigger: "blur" }],
    robotId: [{ required: true, message: "机器人不能为空", trigger: "blur" }],
    url: [{ required: true, message: "封面不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 隐藏搜索按钮操作 */
watch(showSearch, (value) => {
  let oldHeight = proxy.$refs.queryRef.$el.offsetHeight;
  if (value) {
    oldHeight = oldHeight - 12;
  } else {
    oldHeight = oldHeight + 12;
  }
  nextTick(
    () =>
      (tableHeight.value =
        proxy.$refs.tableRef.$el.offsetHeight -
        (proxy.$refs.queryRef.$el.offsetHeight - oldHeight))
  );
});

/** 展开按钮操作 */
function toggleAdvanced() {
  const oldHeight = proxy.$refs.queryRef.$el.offsetHeight;
  advanced.value = !advanced.value;
  nextTick(
    () =>
      (tableHeight.value =
        proxy.$refs.tableRef.$el.offsetHeight -
        (proxy.$refs.queryRef.$el.offsetHeight - oldHeight))
  );
}
/** 查询品类列表 */
function getList() {
  loading.value = true;
  listRobot(queryParams.value).then((response) => {
    robotList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    name: null,
    type: null,
    nums: null,
    hasNums: null,
    robotId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
  };
  proxy.resetForm("robotRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryForm");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加品类";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  getRobot(id).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改品类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["robotRef"].validate((valid) => {
    if (valid) {
      if (form.value.id != null) {
        updateRobot(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRobot(form.value).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const ids = row.id || ids.value;
  proxy.$modal
    .confirm('是否确认删除品类编号为"' + ids + '"的数据项？')
    .then(function () {
      return delRobot(ids);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}
function handleGoCode() {}
/** 删除按钮操作 */
function handleMake(row) {
  const ids = row.id;
  proxy.$modal
    .confirm("是否确认生成？")
    .then(function () {
      return makeCode({ typeId: ids });
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("生成成功");
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "system/robot/export",
    {
      ...queryParams.value,
    },
    `robot_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
