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
              <el-button disabled type="text">品类码信息</el-button>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="btn_box" align="right" style="float: right">
              <!-- <el-button
                class="filter-item"
                style="margin-left: 8px"
                type="primary"
                icon="Plus"
                @click="handleAdd"
                v-hasPermi="['system:code:add']"
                >新增</el-button
              > -->
              <el-button
                class="filter-item"
                style="margin-left: 8px"
                type="danger"
                icon="Delete"
                v-if="!multiple"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['system:code:remove']"
                >删除</el-button
              >
              <el-button
                class="filter-item"
                style="margin-left: 8px"
                type="warning"
                icon="Download"
                @click="handleExport"
                v-hasPermi="['system:code:export']"
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
        :data="codeList"
        @selection-change="handleSelectionChange"
        highlight-current-row
        style="width: 100%"
        :height="tableHeight"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="品类名称" align="center" prop="name" />
        <el-table-column label="溯源码" align="center" prop="code" />
        <el-table-column label="关联机器人" align="center" prop="robotId" />
        <el-table-column label="二维码" align="center" prop="url">
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
        <!-- <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template #default="scope">
            <el-button
              type="text"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:code:edit']"
              >修改</el-button
            >
            <el-divider direction="vertical"></el-divider>
            <el-button
              type="text"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:code:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column> -->
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

      <!-- 添加或修改品类码对话框 -->
      <el-dialog :title="title" v-model="open" width="720px" append-to-body>
        <div class="dialog_box" style="height: 500px">
          <el-form
            ref="codeRef"
            :model="form"
            :rules="rules"
            label-position="top"
          >
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="品类id" prop="typeId">
                  <el-input v-model="form.typeId" placeholder="请输入品类id" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="溯源码" prop="code">
                  <el-input v-model="form.code" placeholder="请输入溯源码" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="二维码地址" prop="url">
                  <el-input v-model="form.url" placeholder="请输入二维码地址" />
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

<script setup name="Code">
import {
  listCode,
  getCode,
  delCode,
  addCode,
  updateCode,
} from "@/api/system/code";
import { useRouter } from "vue-router";
const { currentRoute } = useRouter();
const route = currentRoute.value;
const { proxy } = getCurrentInstance();

let tableHeight = proxy.getInitTableHeight();
const codeList = ref([]);
const open = ref(false);
const url = import.meta.env.VITE_APP_BASE_API;
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
    typeId: null,
    code: null,
    url: null,
  },
  rules: {},
});

const { queryParams, form, rules } = toRefs(data);
onMounted(() => {
  let id = route.query.id || null;
  queryParams.value.typeId = id;
  getList();
});
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

/** 查询品类码列表 */
function getList() {
  loading.value = true;
  listCode(queryParams.value).then((response) => {
    codeList.value = response.rows;
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
    typeId: null,
    code: null,
    url: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
  };
  proxy.resetForm("codeRef");
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
  title.value = "添加品类码";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  getCode(id).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改品类码";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["codeRef"].validate((valid) => {
    if (valid) {
      if (form.value.id != null) {
        updateCode(form.value).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCode(form.value).then((response) => {
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
    .confirm('是否确认删除品类码编号为"' + ids + '"的数据项？')
    .then(function () {
      return delCode(ids);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "system/code/download",
    {
      ...queryParams.value,
    },
    `code_${new Date().getTime()}.zip`
  );
}

// getList();
</script>
