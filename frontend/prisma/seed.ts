import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  console.log('--- SEEDING DATABASE FROM CURRENT BACKUP ---');

  const branches = [
  {
    "id": "b1-uuid",
    "name": "Tony Coffee & Tea chi nhánh 1",
    "address": "22B Lê Anh Xuân, Thị Trấn Krông Kmar, huyện Krông Bông",
    "phone": "0935110447",
    "created_at": "2026-04-11T02:21:45.971Z"
  },
  {
    "id": "b2-uuid",
    "name": "Tony Coffee & Tea chi nhánh 2",
    "address": "44B Lê Anh Xuân, Thị Trấn Krông Kmar, huyện Krông Bông",
    "phone": "0987654321",
    "created_at": "2026-04-11T02:21:45.995Z"
  }
];
  for (const b of branches) { await prisma.branch.upsert({ where: { id: b.id }, update: b, create: b }); }

  const employees = [
  {
    "id": "e1-uuid",
    "username": "tony_admin",
    "password": "$2b$10$Phosh8.GqB/40lvEIfFmluVeT.xz6/bloOiNCIFwCZOHSZVYAOheC",
    "name": "Nguyễn Văn Hạnh",
    "position_name": "Administrator",
    "role": "ADMIN",
    "branch_id": null,
    "created_at": "2026-04-10T08:58:35.701Z"
  },
  {
    "id": "e2-uuid",
    "username": "tony_chinhanh1",
    "password": "$2b$10$Phosh8.GqB/40lvEIfFmluVeT.xz6/bloOiNCIFwCZOHSZVYAOheC",
    "name": "Chi nhánh 1",
    "position_name": "Manager",
    "role": "MANAGER",
    "branch_id": "b1-uuid",
    "created_at": "2026-04-10T08:58:35.701Z"
  },
  {
    "id": "e3-uuid",
    "username": "tony_chinhanh2",
    "password": "$2b$10$Phosh8.GqB/40lvEIfFmluVeT.xz6/bloOiNCIFwCZOHSZVYAOheC",
    "name": "Chi nhánh 2",
    "position_name": "Manager",
    "role": "MANAGER",
    "branch_id": "b2-uuid",
    "created_at": "2026-04-10T08:58:35.701Z"
  }
];
  for (const e of employees) { await prisma.employee.upsert({ where: { id: e.id }, update: e, create: e }); }

  const tables = [
  {
    "id": "0c22539b-306c-4eda-af7e-186d4e7349de",
    "branch_id": "b2-uuid",
    "name": "Bàn 8",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "157b7577-4897-4d42-bd2c-d2ea80d28944",
    "branch_id": "b2-uuid",
    "name": "Bàn 10",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "29f46007-ad04-44b1-bb14-3bcf1b75ecea",
    "branch_id": "b1-uuid",
    "name": "Bàn 8",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "2c68c66e-329d-48c5-b363-6e85abd6b262",
    "branch_id": "b2-uuid",
    "name": "Bàn 2",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "35378245-96c8-432b-9f69-4f910dcf7de6",
    "branch_id": "b1-uuid",
    "name": "Bàn 7",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "46be2959-1eea-4e32-840d-9ed043b2e491",
    "branch_id": "b1-uuid",
    "name": "Bàn 6",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "4c4de19b-5dc4-4cd2-8d75-633906bc1a14",
    "branch_id": "b1-uuid",
    "name": "Bàn 5",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "5fb25500-5362-46c5-a5fb-64154f7f96d2",
    "branch_id": "b2-uuid",
    "name": "Bàn 6",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "60ebc4b1-2f82-4347-9433-13a2b30f75ba",
    "branch_id": "b2-uuid",
    "name": "Bàn 4",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "61fbea86-41c7-4251-8b24-347da69d9a80",
    "branch_id": "b1-uuid",
    "name": "Bàn 2",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "69d60617-f27a-43da-9dcf-bfd39ec63dc8",
    "branch_id": "b2-uuid",
    "name": "Bàn 9",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "6f301637-96f1-4c45-a50f-8522170007d7",
    "branch_id": "b1-uuid",
    "name": "Bàn 10",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "7a48df6a-bc9a-46fb-ae5c-6c1465cb5947",
    "branch_id": "b2-uuid",
    "name": "Bàn 3",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "833376e3-7241-4783-84fb-c5bf5781628c",
    "branch_id": "b1-uuid",
    "name": "Bàn 4",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "9758abe9-4b8b-42ac-902c-7887a4eb71ab",
    "branch_id": "b1-uuid",
    "name": "Bàn 9",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "ab5d69f3-3a11-4213-b69a-675a9a423af7",
    "branch_id": "b2-uuid",
    "name": "Bàn 7",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "b8cb18cb-7462-4857-a631-4e4032473e05",
    "branch_id": "b2-uuid",
    "name": "Bàn 1",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "cec2fc45-5792-4558-8b6c-d2629ba0271c",
    "branch_id": "b2-uuid",
    "name": "Bàn 5",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "e7f19902-4d7f-4db9-a1ea-d8a966c33c1b",
    "branch_id": "b1-uuid",
    "name": "Bàn 3",
    "area": "Chung",
    "status": "AVAILABLE"
  },
  {
    "id": "edd04960-8b63-46c7-b943-58d3fb2cd820",
    "branch_id": "b1-uuid",
    "name": "Bàn 1",
    "area": "Chung",
    "status": "AVAILABLE"
  }
];
  for (const t of tables) { await prisma.table.upsert({ where: { id: t.id }, update: t, create: t }); }

  const materials = [
  {
    "id": "273782fd-07bc-4664-a34a-06c0a1583347",
    "branch_id": "b1-uuid",
    "name": "Cà phê hạt",
    "unit": "kg",
    "cost_per_unit": 200000,
    "stock_current": 20
  },
  {
    "id": "e80be473-89dc-4d83-a134-76ebb3aaeb11",
    "branch_id": "b1-uuid",
    "name": "Sữa đặc",
    "unit": "kg",
    "cost_per_unit": 60000,
    "stock_current": 20
  }
];
  for (const m of materials) { await prisma.material.upsert({ where: { id: m.id }, update: m, create: m }); }

  const products = [
  {
    "id": "099eb23c-d293-418c-9954-9be8bfbf3bca",
    "name_vi": "Nutri",
    "name_en": "Nutri",
    "category": "Nước ngọt",
    "available": true,
    "created_at": "2026-04-04T13:05:59.832Z",
    "updated_at": "2026-04-04T13:05:59.832Z"
  },
  {
    "id": "0b51cece-0d5d-4571-a6f7-9f00440ca2e0",
    "name_vi": "Ép cam",
    "name_en": "Ép cam",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:38.784Z",
    "updated_at": "2026-04-04T13:05:38.784Z"
  },
  {
    "id": "11bc6d46-ca5a-4918-b07c-70621e0f6da4",
    "name_vi": "Number One",
    "name_en": "Number One",
    "category": "Nước ngọt",
    "available": true,
    "created_at": "2026-04-04T13:05:57.768Z",
    "updated_at": "2026-04-04T13:05:57.768Z"
  },
  {
    "id": "195edc05-22a5-40b7-b5f4-583bbe43ab06",
    "name_vi": "Sữa đá me",
    "name_en": "Sữa đá me",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:54.761Z",
    "updated_at": "2026-04-04T13:05:54.761Z"
  },
  {
    "id": "1cddac6b-ee9b-4e61-9dee-69a73824d91d",
    "name_vi": "Sữa chua trái cây",
    "name_en": "Sữa chua trái cây",
    "category": "Yogurt",
    "available": true,
    "created_at": "2026-04-04T13:05:48.187Z",
    "updated_at": "2026-04-04T13:05:48.187Z"
  },
  {
    "id": "254fff07-a8ad-43f2-a79b-642bcddffb0b",
    "name_vi": "Bạc xỉu đá",
    "name_en": "Bạc xỉu đá",
    "category": "Cà phê",
    "available": true,
    "created_at": "2026-04-04T13:05:33.783Z",
    "updated_at": "2026-04-11T05:59:34.663Z"
  },
  {
    "id": "3584ec1f-fb3a-47e9-a384-0aa4a4d24de4",
    "name_vi": "Milo dầm full topping",
    "name_en": "Milo dầm full topping",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:53.773Z",
    "updated_at": "2026-04-04T13:05:53.773Z"
  },
  {
    "id": "36f97ffc-6804-4e74-9c23-849a24f34d5d",
    "name_vi": "Trà chanh dây xoài",
    "name_en": "Trà chanh dây xoài",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:34.282Z",
    "updated_at": "2026-04-04T13:05:34.282Z"
  },
  {
    "id": "38e1a571-141b-492b-a11c-7902798304f3",
    "name_vi": "Pepsi",
    "name_en": "Pepsi",
    "category": "Nước ngọt",
    "available": true,
    "created_at": "2026-04-04T13:05:58.272Z",
    "updated_at": "2026-04-04T13:05:58.272Z"
  },
  {
    "id": "399efe2e-5349-49b2-bcf6-9ef215377d77",
    "name_vi": "Bò húc",
    "name_en": "Bò húc",
    "category": "Nước ngọt",
    "available": true,
    "created_at": "2026-04-04T13:06:00.345Z",
    "updated_at": "2026-04-04T13:06:00.345Z"
  },
  {
    "id": "3f4285ee-6187-4835-8cca-5dcb91b39a1d",
    "name_vi": "Ép chanh dây mix vị",
    "name_en": "Ép chanh dây mix vị",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:43.267Z",
    "updated_at": "2026-04-04T13:05:43.267Z"
  },
  {
    "id": "42e91952-90dc-48fb-b1f3-27b46c04a950",
    "name_vi": "Ca cao đá",
    "name_en": "Ca cao đá",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:55.259Z",
    "updated_at": "2026-04-04T13:05:55.259Z"
  },
  {
    "id": "462bd880-529a-4c96-8b80-232d2c14114f",
    "name_vi": "Kem plan",
    "name_en": "Kem plan",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:53.272Z",
    "updated_at": "2026-04-04T13:05:53.272Z"
  },
  {
    "id": "4b314646-836f-4a4b-8248-f21e4bf08e6a",
    "name_vi": "Sinh tố bơ",
    "name_en": "Sinh tố bơ",
    "category": "Sinh tố",
    "available": true,
    "created_at": "2026-04-04T13:05:45.706Z",
    "updated_at": "2026-04-04T13:05:45.706Z"
  },
  {
    "id": "4da4639c-b920-4d96-a20b-1f5cd03b7fe3",
    "name_vi": "Trà dưa lưới",
    "name_en": "Trà dưa lưới",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:36.301Z",
    "updated_at": "2026-04-04T13:05:36.301Z"
  },
  {
    "id": "4daa4dab-125f-4b7a-8485-2ba5dcad0f12",
    "name_vi": "Ép cam cà rốt",
    "name_en": "Ép cam cà rốt",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:41.781Z",
    "updated_at": "2026-04-04T13:05:41.781Z"
  },
  {
    "id": "4de97847-1c0e-40b7-81a9-46bbe0558192",
    "name_vi": "Trà lipton",
    "name_en": "Trà lipton",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:36.795Z",
    "updated_at": "2026-04-04T13:05:36.795Z"
  },
  {
    "id": "55a5eabc-ed02-4dda-9f6b-a14a09b04835",
    "name_vi": "Trà chanh dây",
    "name_en": "Trà chanh dây",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:37.789Z",
    "updated_at": "2026-04-04T13:05:37.789Z"
  },
  {
    "id": "5a3325bc-fb90-4d81-bd6e-3bdfe3f07c09",
    "name_vi": "Ép dưa hấu",
    "name_en": "Ép dưa hấu",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:42.275Z",
    "updated_at": "2026-04-04T13:05:42.275Z"
  },
  {
    "id": "5f664b64-1cd0-4bbd-a252-d0aa57afeeda",
    "name_vi": "Sữa chua dâu tươi",
    "name_en": "Sữa chua dâu tươi",
    "category": "Yogurt",
    "available": true,
    "created_at": "2026-04-04T13:05:47.689Z",
    "updated_at": "2026-04-04T13:05:47.689Z"
  },
  {
    "id": "6273bc24-f2ea-4cfa-8a50-14335c4e9ab0",
    "name_vi": "Ép táo",
    "name_en": "Ép táo",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:42.769Z",
    "updated_at": "2026-04-04T13:05:42.769Z"
  },
  {
    "id": "6307092c-a26a-48f3-9349-9617b941af61",
    "name_vi": "Ép chanh dây",
    "name_en": "Ép chanh dây",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:40.786Z",
    "updated_at": "2026-04-04T13:05:40.786Z"
  },
  {
    "id": "6b644cb5-e5b2-42dd-b56a-28e71eb0a326",
    "name_vi": "Trà lá hán quả",
    "name_en": "Trà lá hán quả",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:37.292Z",
    "updated_at": "2026-04-04T13:05:37.292Z"
  },
  {
    "id": "7edd5797-2c29-419d-bfd7-d3f7a0e350f1",
    "name_vi": "Cafe kem muối",
    "name_en": "Cafe kem muối",
    "category": "Cà phê",
    "available": true,
    "created_at": "2026-04-04T13:05:33.283Z",
    "updated_at": "2026-04-04T13:05:33.283Z"
  },
  {
    "id": "82ad1442-c1e2-4b8b-97ed-c834238f3bcf",
    "name_vi": "Sữa chua thạch",
    "name_en": "Sữa chua thạch",
    "category": "Yogurt",
    "available": true,
    "created_at": "2026-04-04T13:05:47.193Z",
    "updated_at": "2026-04-04T13:05:47.193Z"
  },
  {
    "id": "8634157a-41fd-4cec-9536-b4cbcdf808f4",
    "name_vi": "Sting",
    "name_en": "Sting",
    "category": "Nước ngọt",
    "available": true,
    "created_at": "2026-04-04T13:05:57.273Z",
    "updated_at": "2026-04-04T13:05:57.273Z"
  },
  {
    "id": "86577f45-2fce-4101-bdd8-eccb29027ae0",
    "name_vi": "Trà lipton",
    "name_en": "Trà lipton",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:51.213Z",
    "updated_at": "2026-04-04T13:05:51.213Z"
  },
  {
    "id": "86af7c99-6046-4c11-918e-751cfba53f9b",
    "name_vi": "Trái cây dĩa",
    "name_en": "Trái cây dĩa",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:54.267Z",
    "updated_at": "2026-04-04T13:05:54.267Z"
  },
  {
    "id": "894b3f9c-ccfa-4674-80a2-8999043b080b",
    "name_vi": "Trà đào cam sả",
    "name_en": "Trà đào cam sả",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:35.790Z",
    "updated_at": "2026-04-04T13:05:35.790Z"
  },
  {
    "id": "8a5658c5-a45b-406d-9d04-9fcb200d1694",
    "name_vi": "Ép ổi",
    "name_en": "Ép ổi",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:41.285Z",
    "updated_at": "2026-04-04T13:05:41.285Z"
  },
  {
    "id": "90e0a6e4-8bfb-40b5-91aa-12118a3e9411",
    "name_vi": "Chanh đá",
    "name_en": "Chanh đá",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:55.761Z",
    "updated_at": "2026-04-04T13:05:55.761Z"
  },
  {
    "id": "93b2a23e-0889-41be-a620-b16b986a2894",
    "name_vi": "Sữa chua đá",
    "name_en": "Sữa chua đá",
    "category": "Yogurt",
    "available": true,
    "created_at": "2026-04-04T13:05:48.693Z",
    "updated_at": "2026-04-04T13:05:48.693Z"
  },
  {
    "id": "99964467-7b2a-4a4a-944f-824d30cfda7c",
    "name_vi": "Sữa chua hũ",
    "name_en": "Sữa chua hũ",
    "category": "Yogurt",
    "available": true,
    "created_at": "2026-04-04T13:05:50.202Z",
    "updated_at": "2026-04-04T13:05:50.202Z"
  },
  {
    "id": "9b336c2b-9787-4b6a-920c-ff77106cccaf",
    "name_vi": "Ép cà rốt",
    "name_en": "Ép cà rốt",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:40.289Z",
    "updated_at": "2026-04-04T13:05:40.289Z"
  },
  {
    "id": "a48ec84b-5d2c-4ac4-906d-17919fdf685e",
    "name_vi": "Trà lá hán quả",
    "name_en": "Trà lá hán quả",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:51.716Z",
    "updated_at": "2026-04-04T13:05:51.716Z"
  },
  {
    "id": "a4bc96c2-9800-4b51-9b29-ff5ec5474f4d",
    "name_vi": "Cafe sữa đá",
    "name_en": "Cafe sữa đá",
    "category": "Cà phê",
    "available": true,
    "created_at": "2026-04-04T13:05:32.282Z",
    "updated_at": "2026-04-04T13:05:32.282Z"
  },
  {
    "id": "ac3d2c5f-2b54-4a27-8e15-f5a93dfe49a0",
    "name_vi": "Trà dâu",
    "name_en": "Trà dâu",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:34.781Z",
    "updated_at": "2026-04-04T13:05:34.781Z"
  },
  {
    "id": "b0412c90-9c8e-4a28-b9de-3dc73828316f",
    "name_vi": "Sinh tố xoài",
    "name_en": "Sinh tố xoài",
    "category": "Sinh tố",
    "available": true,
    "created_at": "2026-04-04T13:05:46.201Z",
    "updated_at": "2026-04-04T13:05:46.201Z"
  },
  {
    "id": "b05a6c5f-d32d-4c46-8181-4cabc9854ccb",
    "name_vi": "Sữa chua hạt đác",
    "name_en": "Sữa chua hạt đác",
    "category": "Yogurt",
    "available": true,
    "created_at": "2026-04-04T13:05:49.697Z",
    "updated_at": "2026-04-04T13:05:49.697Z"
  },
  {
    "id": "b148eb6e-ea8d-4236-ba29-e09f5b4057fe",
    "name_vi": "Sữa chua chanh dây",
    "name_en": "Sữa chua chanh dây",
    "category": "Yogurt",
    "available": true,
    "created_at": "2026-04-04T13:05:49.189Z",
    "updated_at": "2026-04-04T13:05:49.189Z"
  },
  {
    "id": "b490fe36-e7b7-43df-a45b-a3ba08e257b9",
    "name_vi": "Sinh tố việt quất",
    "name_en": "Sinh tố việt quất",
    "category": "Sinh tố",
    "available": true,
    "created_at": "2026-04-04T13:05:44.199Z",
    "updated_at": "2026-04-04T13:05:44.199Z"
  },
  {
    "id": "b7c99fc2-9729-495c-ac65-8ba70cdf273f",
    "name_vi": "Cafe đen đá",
    "name_en": "Cafe đen đá",
    "category": "Cà phê",
    "available": true,
    "created_at": "2026-04-04T13:05:31.755Z",
    "updated_at": "2026-04-04T13:05:31.755Z"
  },
  {
    "id": "bfc5e55d-4559-440b-8b88-57b4589795b8",
    "name_vi": "Coca",
    "name_en": "Coca",
    "category": "Nước ngọt",
    "available": true,
    "created_at": "2026-04-04T13:05:58.780Z",
    "updated_at": "2026-04-04T13:05:58.780Z"
  },
  {
    "id": "c2ed4985-cbca-4fcc-9485-35a40bb81741",
    "name_vi": "Revive",
    "name_en": "Revive",
    "category": "Nước ngọt",
    "available": true,
    "created_at": "2026-04-04T13:05:59.298Z",
    "updated_at": "2026-04-04T13:05:59.298Z"
  },
  {
    "id": "c7bf40e1-4aa7-44d8-a19a-84f42284be7c",
    "name_vi": "Ép cóc",
    "name_en": "Ép cóc",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:39.287Z",
    "updated_at": "2026-04-04T13:05:39.287Z"
  },
  {
    "id": "caa414c0-267c-486d-b5cc-c25c57b7633e",
    "name_vi": "Trà trái cây",
    "name_en": "Trà trái cây",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:38.283Z",
    "updated_at": "2026-04-04T13:05:38.283Z"
  },
  {
    "id": "cd55aecd-c5d6-4217-8f1b-7bd5ad4d86dc",
    "name_vi": "Chanh muối",
    "name_en": "Chanh muối",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:56.269Z",
    "updated_at": "2026-04-04T13:05:56.269Z"
  },
  {
    "id": "d03d797c-1bc7-4375-8592-4f453a19414a",
    "name_vi": "Sinh tố kiwi",
    "name_en": "Sinh tố kiwi",
    "category": "Sinh tố",
    "available": true,
    "created_at": "2026-04-04T13:05:45.197Z",
    "updated_at": "2026-04-04T13:05:45.197Z"
  },
  {
    "id": "d398c812-91ba-4c05-8263-249a5ca3c807",
    "name_vi": "Cacao nóng",
    "name_en": "Cacao nóng",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:52.212Z",
    "updated_at": "2026-04-04T13:05:52.212Z"
  },
  {
    "id": "d4f6fffd-1d8e-4659-9764-6bec09c0b4c2",
    "name_vi": "Ép cà chua",
    "name_en": "Ép cà chua",
    "category": "Nước ép",
    "available": true,
    "created_at": "2026-04-04T13:05:39.784Z",
    "updated_at": "2026-04-04T13:05:39.784Z"
  },
  {
    "id": "dba8baad-2b37-48ae-bda4-1f5a69e27295",
    "name_vi": "Bạc xỉu nóng",
    "name_en": "Bạc xỉu nóng",
    "category": "Cà phê",
    "available": true,
    "created_at": "2026-04-04T13:05:52.770Z",
    "updated_at": "2026-04-04T13:05:52.770Z"
  },
  {
    "id": "dd7ab637-2558-4fef-938a-975451188ccf",
    "name_vi": "Ca cao kem muối",
    "name_en": "Ca cao kem muối",
    "category": "Khác",
    "available": true,
    "created_at": "2026-04-04T13:05:56.771Z",
    "updated_at": "2026-04-04T13:05:56.771Z"
  },
  {
    "id": "e338602e-ee43-4b92-855f-fe2b4da1f48f",
    "name_vi": "Sinh tố sapoche",
    "name_en": "Sinh tố sapoche",
    "category": "Sinh tố",
    "available": true,
    "created_at": "2026-04-04T13:05:46.694Z",
    "updated_at": "2026-04-04T13:05:46.694Z"
  },
  {
    "id": "ea29c580-eb5f-4443-85ca-e6a3e820caa7",
    "name_vi": "Trà đào",
    "name_en": "Trà đào",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:35.289Z",
    "updated_at": "2026-04-04T13:05:35.289Z"
  },
  {
    "id": "efbca89d-00be-4b7b-9363-dd38109c99c8",
    "name_vi": "Trà gừng",
    "name_en": "Trà gừng",
    "category": "Trà",
    "available": true,
    "created_at": "2026-04-04T13:05:50.708Z",
    "updated_at": "2026-04-04T13:05:50.708Z"
  },
  {
    "id": "f1a539b8-efc5-405e-8389-26f909b4785f",
    "name_vi": "Sinh tố dâu",
    "name_en": "Sinh tố dâu",
    "category": "Sinh tố",
    "available": true,
    "created_at": "2026-04-04T13:05:44.698Z",
    "updated_at": "2026-04-04T13:05:44.698Z"
  }
];
  for (const p of products) { await prisma.product.upsert({ where: { id: p.id }, update: p, create: p }); }

  const productVariants = [
  {
    "id": "01c15ccd-7327-460b-b8f3-5cf3e5b9520f",
    "product_id": "8a5658c5-a45b-406d-9d04-9fcb200d1694",
    "size": "M",
    "price": 30000
  },
  {
    "id": "04eabd4d-3291-48e7-8bd4-8d40692de653",
    "product_id": "6273bc24-f2ea-4cfa-8a50-14335c4e9ab0",
    "size": "M",
    "price": 35000
  },
  {
    "id": "1d43ec0d-220d-4bb7-ac62-8270e1f07120",
    "product_id": "e338602e-ee43-4b92-855f-fe2b4da1f48f",
    "size": "M",
    "price": 35000
  },
  {
    "id": "29595e88-7319-4a9b-80e4-484a1dc5f275",
    "product_id": "42e91952-90dc-48fb-b1f3-27b46c04a950",
    "size": "M",
    "price": 30000
  },
  {
    "id": "31674caf-6206-4be8-bf96-5dfc87c74e73",
    "product_id": "4de97847-1c0e-40b7-81a9-46bbe0558192",
    "size": "M",
    "price": 20000
  },
  {
    "id": "3267daf5-6514-4af3-9b5d-6b9d4a522ab3",
    "product_id": "d4f6fffd-1d8e-4659-9764-6bec09c0b4c2",
    "size": "M",
    "price": 28000
  },
  {
    "id": "35d9edf8-662b-4599-94af-fe6760cb14f5",
    "product_id": "11bc6d46-ca5a-4918-b07c-70621e0f6da4",
    "size": "M",
    "price": 15000
  },
  {
    "id": "36cbf470-7ac5-454f-829d-1b2ce040a82c",
    "product_id": "4da4639c-b920-4d96-a20b-1f5cd03b7fe3",
    "size": "M",
    "price": 34000
  },
  {
    "id": "36df2027-33c8-4dc9-9e5a-ec7fcddbe956",
    "product_id": "ac3d2c5f-2b54-4a27-8e15-f5a93dfe49a0",
    "size": "M",
    "price": 30000
  },
  {
    "id": "373a7ca7-50c5-42e8-9d2e-abdd7fdbfeaf",
    "product_id": "3584ec1f-fb3a-47e9-a384-0aa4a4d24de4",
    "size": "M",
    "price": 35000
  },
  {
    "id": "3c48f85f-da77-4133-809f-30ab3a04a81e",
    "product_id": "caa414c0-267c-486d-b5cc-c25c57b7633e",
    "size": "M",
    "price": 35000
  },
  {
    "id": "42899032-873f-4499-9a6f-a84bd09ec8a1",
    "product_id": "a48ec84b-5d2c-4ac4-906d-17919fdf685e",
    "size": "M",
    "price": 25000
  },
  {
    "id": "46fca19e-8213-4694-b57a-f6f4d26cb995",
    "product_id": "38e1a571-141b-492b-a11c-7902798304f3",
    "size": "M",
    "price": 15000
  },
  {
    "id": "4b58fe14-082a-4b72-a5d2-b3739d142c0a",
    "product_id": "82ad1442-c1e2-4b8b-97ed-c834238f3bcf",
    "size": "M",
    "price": 28000
  },
  {
    "id": "4dd9838b-7afb-48a5-b94a-cdadbbd5c665",
    "product_id": "4daa4dab-125f-4b7a-8485-2ba5dcad0f12",
    "size": "M",
    "price": 32000
  },
  {
    "id": "4ff74ba1-d2f2-4296-a93f-e8af59bbee5c",
    "product_id": "93b2a23e-0889-41be-a620-b16b986a2894",
    "size": "M",
    "price": 25000
  },
  {
    "id": "6a37b5d1-9f2b-4ce8-93fa-4bd2f6c2f1c9",
    "product_id": "99964467-7b2a-4a4a-944f-824d30cfda7c",
    "size": "M",
    "price": 20000
  },
  {
    "id": "6c1cc7ed-6e05-4b4d-920c-b19703563a6d",
    "product_id": "dd7ab637-2558-4fef-938a-975451188ccf",
    "size": "M",
    "price": 35000
  },
  {
    "id": "6c374359-1056-4064-8faa-4a3b6331114c",
    "product_id": "36f97ffc-6804-4e74-9c23-849a24f34d5d",
    "size": "M",
    "price": 32000
  },
  {
    "id": "7202e093-a226-4e8a-a310-1aec501faeff",
    "product_id": "c7bf40e1-4aa7-44d8-a19a-84f42284be7c",
    "size": "M",
    "price": 32000
  },
  {
    "id": "775aac1f-536e-48e9-bd66-4e8d99929882",
    "product_id": "5f664b64-1cd0-4bbd-a252-d0aa57afeeda",
    "size": "M",
    "price": 30000
  },
  {
    "id": "8a2e8c6c-2a86-474e-b330-fdfe3fce434e",
    "product_id": "894b3f9c-ccfa-4674-80a2-8999043b080b",
    "size": "M",
    "price": 35000
  },
  {
    "id": "8b2edb00-e048-4aa3-ae70-23ae3b8491a4",
    "product_id": "6307092c-a26a-48f3-9349-9617b941af61",
    "size": "M",
    "price": 30000
  },
  {
    "id": "8cfb1c00-0d55-46c7-ba7a-4b54c3a39503",
    "product_id": "254fff07-a8ad-43f2-a79b-642bcddffb0b",
    "size": "M",
    "price": 28000
  },
  {
    "id": "9bba024c-9327-434c-aa59-c9b56419b663",
    "product_id": "cd55aecd-c5d6-4217-8f1b-7bd5ad4d86dc",
    "size": "M",
    "price": 22000
  },
  {
    "id": "9bf0a50c-1b20-4bab-baf3-d3bcbc33bc5b",
    "product_id": "3f4285ee-6187-4835-8cca-5dcb91b39a1d",
    "size": "M",
    "price": 35000
  },
  {
    "id": "9ee8fe65-fe9b-4fb8-96bf-1f67dac930e8",
    "product_id": "8634157a-41fd-4cec-9536-b4cbcdf808f4",
    "size": "M",
    "price": 15000
  },
  {
    "id": "a0ccc78a-46df-47bb-b446-cdeab1281817",
    "product_id": "efbca89d-00be-4b7b-9363-dd38109c99c8",
    "size": "M",
    "price": 22000
  },
  {
    "id": "a5290880-1c04-48a9-8b6a-924dfd12d1c5",
    "product_id": "462bd880-529a-4c96-8b80-232d2c14114f",
    "size": "M",
    "price": 20000
  },
  {
    "id": "acca30d6-db3f-49a2-9896-42af6ea0d038",
    "product_id": "55a5eabc-ed02-4dda-9f6b-a14a09b04835",
    "size": "M",
    "price": 30000
  },
  {
    "id": "ad01ddda-93b3-4d5d-8039-6e9183e37859",
    "product_id": "099eb23c-d293-418c-9954-9be8bfbf3bca",
    "size": "M",
    "price": 18000
  },
  {
    "id": "b148b395-8b3a-4c2d-a05c-b65e3907d371",
    "product_id": "b0412c90-9c8e-4a28-b9de-3dc73828316f",
    "size": "M",
    "price": 38000
  },
  {
    "id": "b2a88f8b-cac9-4e19-9a2d-00a025b9d447",
    "product_id": "b7c99fc2-9729-495c-ac65-8ba70cdf273f",
    "size": "M",
    "price": 20000
  },
  {
    "id": "b401e5b3-7353-41df-b4ae-6872f02bab62",
    "product_id": "90e0a6e4-8bfb-40b5-91aa-12118a3e9411",
    "size": "M",
    "price": 20000
  },
  {
    "id": "b4be3e45-d252-43da-8370-5843967de16d",
    "product_id": "d03d797c-1bc7-4375-8592-4f453a19414a",
    "size": "M",
    "price": 42000
  },
  {
    "id": "b69333b4-8846-432d-8147-b0eed01cbe8b",
    "product_id": "9b336c2b-9787-4b6a-920c-ff77106cccaf",
    "size": "M",
    "price": 28000
  },
  {
    "id": "b7d2dc5e-66a5-429d-b53c-022d809617bc",
    "product_id": "a4bc96c2-9800-4b51-9b29-ff5ec5474f4d",
    "size": "M",
    "price": 25000
  },
  {
    "id": "b949f1e9-0a05-4d5a-8e6e-76231f5acf8c",
    "product_id": "b490fe36-e7b7-43df-a45b-a3ba08e257b9",
    "size": "M",
    "price": 40000
  },
  {
    "id": "c0f458cb-33e7-4c03-8373-98a5e0579ffa",
    "product_id": "dba8baad-2b37-48ae-bda4-1f5a69e27295",
    "size": "M",
    "price": 32000
  },
  {
    "id": "c18aa188-2dfc-4cfc-a783-82f3ee88da72",
    "product_id": "4b314646-836f-4a4b-8248-f21e4bf08e6a",
    "size": "M",
    "price": 40000
  },
  {
    "id": "c49787fb-ae17-4f2c-a7d9-41ed4ec763d0",
    "product_id": "0b51cece-0d5d-4571-a6f7-9f00440ca2e0",
    "size": "M",
    "price": 30000
  },
  {
    "id": "c9b1be8d-5d81-4dab-bf43-8912db299bb1",
    "product_id": "7edd5797-2c29-419d-bfd7-d3f7a0e350f1",
    "size": "M",
    "price": 35000
  },
  {
    "id": "cd6c2a96-242b-41ae-b220-78a7aad6c61b",
    "product_id": "b148eb6e-ea8d-4236-ba29-e09f5b4057fe",
    "size": "M",
    "price": 30000
  },
  {
    "id": "d1b98a1f-3b87-441a-9782-3579f1393199",
    "product_id": "399efe2e-5349-49b2-bcf6-9ef215377d77",
    "size": "M",
    "price": 20000
  },
  {
    "id": "d4d36122-b04e-4389-b577-1c47f0a35cd1",
    "product_id": "86577f45-2fce-4101-bdd8-eccb29027ae0",
    "size": "M",
    "price": 20000
  },
  {
    "id": "d4d8207d-2a2d-4e91-8d27-19faae7d34a9",
    "product_id": "195edc05-22a5-40b7-b5f4-583bbe43ab06",
    "size": "M",
    "price": 25000
  },
  {
    "id": "dfacb257-fdd4-4165-9e78-6643a0b4ab1d",
    "product_id": "c2ed4985-cbca-4fcc-9485-35a40bb81741",
    "size": "M",
    "price": 18000
  },
  {
    "id": "e6387ef6-0d74-4492-8715-f984f5c508ae",
    "product_id": "bfc5e55d-4559-440b-8b88-57b4589795b8",
    "size": "M",
    "price": 15000
  },
  {
    "id": "e8479213-0523-4aa5-8ea0-6de378668791",
    "product_id": "86af7c99-6046-4c11-918e-751cfba53f9b",
    "size": "M",
    "price": 40000
  },
  {
    "id": "ea13bc7d-d23d-4b3d-bde1-f50e8e92a200",
    "product_id": "d398c812-91ba-4c05-8263-249a5ca3c807",
    "size": "M",
    "price": 30000
  },
  {
    "id": "edbdca9c-7633-4104-abbd-b1c33fec645b",
    "product_id": "b05a6c5f-d32d-4c46-8181-4cabc9854ccb",
    "size": "M",
    "price": 32000
  },
  {
    "id": "f26a9756-b22f-4ca9-ade9-0eb93b144010",
    "product_id": "5a3325bc-fb90-4d81-bd6e-3bdfe3f07c09",
    "size": "M",
    "price": 28000
  },
  {
    "id": "f613fa18-5bd6-43db-8233-5ad67d3ca100",
    "product_id": "f1a539b8-efc5-405e-8389-26f909b4785f",
    "size": "M",
    "price": 38000
  },
  {
    "id": "f68fbae3-0070-4bee-9c69-2899045b1ec7",
    "product_id": "6b644cb5-e5b2-42dd-b56a-28e71eb0a326",
    "size": "M",
    "price": 28000
  },
  {
    "id": "f93b77b2-6419-43aa-9a77-acc44a88f209",
    "product_id": "ea29c580-eb5f-4443-85ca-e6a3e820caa7",
    "size": "M",
    "price": 32000
  },
  {
    "id": "fc1f54b2-4556-4981-99aa-0ef87ec0770c",
    "product_id": "1cddac6b-ee9b-4e61-9dee-69a73824d91d",
    "size": "M",
    "price": 32000
  }
];
  for (const pv of productVariants) { await prisma.productVariant.upsert({ where: { id: pv.id }, update: pv, create: pv }); }

  const toppings: any[] = [];
  for (const t of toppings) { await prisma.topping.upsert({ where: { id: t.id }, update: t, create: t }); }

  const productRecipes = [
  {
    "id": "1d3c087d-b788-462b-8bd7-4d66d2c187a4",
    "variant_id": "b7d2dc5e-66a5-429d-b53c-022d809617bc",
    "material_id": "273782fd-07bc-4664-a34a-06c0a1583347",
    "quantity": 0.03
  },
  {
    "id": "c89a9b93-32a4-40a2-a16f-a9f2b5efb877",
    "variant_id": "b7d2dc5e-66a5-429d-b53c-022d809617bc",
    "material_id": "e80be473-89dc-4d83-a134-76ebb3aaeb11",
    "quantity": 0.03
  }
];
  for (const pr of productRecipes) { await prisma.productRecipe.upsert({ where: { id: pr.id }, update: pr, create: pr }); }

  const toppingRecipes: any[] = [];
  for (const tr of toppingRecipes) { await prisma.toppingRecipe.upsert({ where: { id: tr.id }, update: tr, create: tr }); }

  // Seed 50 orders for Cafe sữa đá with various times and days
  console.log('--- SEEDING 50 ORDERS FOR CAFE SỮA ĐÁ ---');
  
  const cafeSuaDaProductId = "a4bc96c2-9800-4b51-9b29-ff5ec5474f4d";
  const cafeSuaDaVariantId = "b7d2dc5e-66a5-429d-b53c-022d809617bc";
  const branchIds = ["b1-uuid", "b2-uuid"];
  const tableIds = [
    "0c22539b-306c-4eda-af7e-186d4e7349de", "157b7577-4897-4d42-bd2c-d2ea80d28944", "29f46007-ad04-44b1-bb14-3bcf1b75ecea",
    "2c68c66e-329d-48c5-b363-6e85abd6b262", "35378245-96c8-432b-9f69-4f910dcf7de6", "46be2959-1eea-4e32-840d-9ed043b2e491",
    "4c4de19b-5dc4-4cd2-8d75-633906bc1a14", "5fb25500-5362-46c5-a5fb-64154f7f96d2", "60ebc4b1-2f82-4347-9433-13a2b30f75ba",
    "61fbea86-41c7-4251-8b24-347da69d9a80"
  ];
  
  // Generate orders over the past 14 days with different hours
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  
  for (let i = 0; i < 50; i++) {
    const dayOffset = Math.floor(i / 4); // Distribute across ~12 days
    const hour = hours[i % hours.length];
    const branchId = branchIds[i % branchIds.length];
    const tableId = tableIds[(i + Math.floor(i/3)) % tableIds.length];
    
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - dayOffset);
    orderDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 cups per order
    const unitPrice = 25000;
    const subtotal = quantity * unitPrice;
    
    const order = await prisma.order.create({
      data: {
        order_number: `TONY-${String(orderDate.getDate()).padStart(2, '0')}${String(orderDate.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        branch_id: branchId,
        table_id: tableId,
        status: "COMPLETED",
        payment_method: "CASH",
        order_type: "TAKEAWAY",
        source: "POS",
        total_amount: subtotal,
        discount_amount: 0,
        final_amount: subtotal,
        created_at: orderDate,
      }
    });
    
    await prisma.orderItem.create({
      data: {
        order_id: order.id,
        product_id: cafeSuaDaProductId,
        variant_id: cafeSuaDaVariantId,
        quantity: quantity,
        unit_price: unitPrice,
        subtotal: subtotal,
        note: null,
      }
    });

    // Deduct materials based on recipe
    const recipes = await prisma.productRecipe.findMany({
      where: { variant_id: cafeSuaDaVariantId },
      include: { material: true }
    });

    for (const recipe of recipes) {
      const amountUsed = recipe.quantity * quantity;
      const material = await prisma.material.findUnique({ where: { id: recipe.material_id } });
      if (material) {
        await prisma.material.update({
          where: { id: recipe.material_id },
          data: { stock_current: material.stock_current - amountUsed }
        });
        await prisma.materialTransaction.create({
          data: {
            material_id: recipe.material_id,
            type: "USED",
            quantity: -amountUsed,
            note: `Seed: Đơn ${order.order_number}`,
          }
        });
      }
    }
  }
  console.log('--- 50 ORDERS SEEDED ---');

  console.log('--- SEEDING COMPLETED ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
