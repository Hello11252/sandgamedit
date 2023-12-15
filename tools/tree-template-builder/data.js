
const TRUNK_TEMPLATES = [
    {"entries":[[0,0,1],[0,1,1],[0,2,1],[0,3,1],[0,4,1],[0,5,1],[0,6,1],[0,7,1],[0,8,1],[0,9,1],[0,10,1],[0,11,1],[0,12,1],[0,13,1],[0,14,1],[0,15,1],[0,16,1],[0,17,1],[1,17,1],[1,18,1],[2,18,1],[3,18,1],[4,19,1],[5,20,1],[6,21,2],[1,19,1],[1,20,1],[1,21,1],[1,22,1],[1,23,1],[0,23,1],[-1,23,1],[-2,24,1],[-3,25,1],[-4,25,1],[-5,25,1],[-6,25,2],[1,24,1],[2,25,1],[2,26,1],[2,27,1],[3,28,1],[4,29,1],[5,30,1],[6,30,2],[1,28,1],[1,29,1],[0,30,1,[[-1,31,1],[-2,31,1],[-1,32,1],[0,33,1],[0,34,1],[1,35,1],[1,36,2],[-3,32,1],[-4,33,1],[-5,33,1],[-6,33,2]]],[1,0,1],[1,1,1],[1,2,1],[1,3,1],[1,4,1],[1,5,1],[1,6,1],[1,7,1],[1,8,1],[1,9,1],[1,10,1],[1,11,1],[1,12,1],[1,13,1],[1,14,1],[1,15,1],[1,16,1],[2,17,1],[3,19,1],[2,19,1],[2,20,1],[2,21,1],[2,22,1],[2,23,1],[2,24,1],[3,25,1],[3,26,1],[3,27,1],[2,28,1],[2,29,1],[2,30,1],[2,31,1],[3,32,1],[4,33,1],[5,34,1],[6,35,1,[[7,36,1],[8,36,1],[9,37,1],[9,38,2],[10,38,1],[11,39,1],[12,39,1],[13,40,1],[14,40,1],[15,40,1],[16,40,1],[17,40,2],[5,36,1],[5,37,1],[6,38,1],[6,39,1],[7,40,1],[7,41,1],[7,42,1],[8,43,1],[8,44,1],[9,45,2],[4,38,1],[3,38,1],[2,39,1],[1,39,1],[2,40,2],[0,40,1],[-1,40,1],[-2,41,1],[-3,41,1],[-4,42,1],[-5,42,1],[-6,43,1],[-7,43,1],[-8,43,2]]],[4,20,1],[5,21,1],[6,21,2],[6,22,1],[7,23,1],[8,24,1],[9,25,1],[9,26,2],[10,26,1,[]],[-1,0,1],[-1,1,1],[-1,2,1],[-1,3,1],[-1,4,1],[-1,5,1],[-1,6,1],[-1,7,1],[-1,8,1],[-1,9,1],[-1,10,1],[-1,11,1],[-1,12,1],[-1,13,1],[-1,14,1],[-1,15,1],[-1,16,1],[-1,17,1],[0,18,1],[0,19,1],[0,20,1],[0,21,1],[0,22,1],[-1,24,1],[-2,25,1],[-3,26,1],[-4,26,1],[-5,27,1],[-6,28,1],[-7,29,1],[-8,30,1],[-9,31,1],[-10,32,1],[-11,32,1],[-12,33,1],[-13,34,1],[-14,35,1],[-15,35,1],[-16,35,1],[-17,35,1],[-18,35,2],[-13,36,1],[-13,37,1],[-13,38,1],[-13,39,1],[-14,40,1],[-14,41,1],[-15,41,2],[-14,42,1],[-14,43,1,[[-15,44,1],[-15,45,1],[-14,45,1],[-13,46,1],[-12,46,1],[-11,47,1],[-10,48,1],[-9,49,1],[-8,49,1],[-7,50,1],[-6,51,1],[-5,52,2],[-15,46,1],[-15,47,1],[-16,48,1],[-16,49,1],[-16,50,2]]],[13,41,1],[13,42,1],[14,43,1],[14,44,1],[14,45,1],[15,46,2],[2,0,1],[2,1,1],[2,2,1],[2,3,1],[2,4,1],[2,5,1],[2,6,1],[2,7,1],[2,8,1],[2,9,1],[2,10,1],[2,11,1],[2,12,1],[2,13,1],[2,14,1],[2,15,1],[2,16,1],[0,24,1],[-1,25,1],[-2,26,1],[-3,27,1],[-4,27,1],[-5,28,1],[-6,29,1],[-7,30,1],[-8,31,1],[-8,32,1],[-8,33,1],[-8,34,1],[-8,35,1],[-7,36,1],[-7,37,1],[-6,38,1],[-6,39,1],[-5,40,1],[-5,41,1],[-8,38,2],[10,27,1],[11,28,1],[12,29,1],[13,30,1],[14,31,1],[14,32,1],[15,33,2],[-5,43,1],[-4,44,1],[-3,44,1],[-2,45,1],[-1,46,1],[0,46,1],[1,47,1],[2,48,1],[3,48,1],[4,48,2],[4,49,1],[4,50,1],[5,50,1],[6,50,1],[7,51,1],[8,51,2],[8,52,1],[9,52,1],[10,53,1],[10,54,1],[11,55,1],[12,55,1],[13,56,2],[3,51,1],[3,52,1],[2,53,1],[2,54,1],[1,55,1],[0,55,2],[1,56,1],[1,57,1],[2,58,1],[3,59,1],[4,60,1],[5,61,2],[0,58,1],[-1,58,1],[-2,59,1],[-3,60,1],[-4,61,1],[-5,61,2],[-2,47,2]],"entriesCount":299},
];

const LEAF_CLUSTER_TEMPLATES = [{"entries":[[1,0,3,[[1,-1,3],[2,0,3],[2,-1,3],[3,0,3],[2,1,3],[3,-1,3],[3,1,3],[4,0,3],[3,-2,3],[4,1,3],[3,2,3],[4,-2,3]]],[-1,0,3,[[-2,0,3],[-2,-1,3],[-2,1,3],[-3,0,3],[-3,-1,3],[-2,2,3],[-3,1,3],[-4,0,3],[-2,3,3],[-3,2,3]]],[0,1,3,[[0,2,3],[-1,1,3],[1,1,3],[-1,2,3],[1,2,3],[0,3,3],[2,2,3],[1,3,3],[2,3,3],[1,4,3],[3,3,3],[2,4,3]]],[0,-1,3,[[0,-2,3],[-1,-1,3],[-1,-2,3],[0,-3,3],[1,-2,3],[-2,-2,3],[-1,-3,3],[1,-3,3],[2,-2,3],[2,-3,3],[3,-3,3]]]],"entriesCount":49},{"entries":[[1,0,3,[[2,0,3],[1,1,3],[1,-1,3],[3,0,3],[2,1,3],[2,-1,3],[3,1,3],[4,0,3],[3,-1,3],[4,1,3],[4,-1,3],[5,0,3],[3,-2,3],[4,-2,3],[5,-1,3]]],[0,1,3,[[-1,1,3],[0,2,3],[-2,1,3],[-1,2,3],[0,3,3],[1,2,3],[-2,2,3],[-1,3,3],[0,4,3],[1,3,3],[2,2,3],[-2,3,3],[-1,4,3],[0,5,3],[1,4,3],[2,3,3],[3,2,3]]],[-1,0,3,[[-2,0,3],[-3,0,3],[-2,-1,3],[-4,0,3],[-3,-1,3],[-3,1,3],[-4,1,3],[-4,-1,3],[-3,-2,3],[-3,2,3],[-4,-2,3]]],[0,-1,3,[[-1,-1,3],[0,-2,3],[-1,-2,3],[1,-2,3],[0,-3,3],[-2,-2,3],[-1,-3,3],[1,-3,3],[2,-2,3]]]],"entriesCount":56},{"entries":[[0,-1,3,[[1,-1,3],[-1,-1,3],[0,-2,3],[1,-2,3],[-2,-1,3],[-1,-2,3],[0,-3,3],[1,-3,3],[2,-2,3],[-2,-2,3],[-1,-3,3],[0,-4,3],[2,-3,3],[-3,-2,3],[-1,-4,3],[3,-3,3],[4,-3,3]]],[1,0,3,[[2,0,3],[2,1,3],[2,-1,3],[3,0,3],[3,1,3],[3,-1,3],[4,0,3],[3,2,3],[4,1,3],[3,-2,3],[4,-1,3],[5,0,3],[4,2,3],[5,1,3],[4,-2,3],[5,-1,3],[6,0,3],[4,3,3],[6,-1,3],[7,0,3],[4,4,3],[7,-1,3],[4,5,3],[5,4,3]]],[-1,0,3,[[-2,0,3],[-2,1,3],[-3,0,3],[-3,1,3],[-4,0,3],[-3,-1,3],[-4,1,3],[-4,-1,3],[-5,0,3],[-4,2,3],[-5,1,3],[-5,-1,3],[-4,-2,3],[-6,0,3],[-4,3,3],[-5,2,3],[-6,1,3],[-5,3,3]]],[0,1,3,[[-1,1,3],[1,1,3],[0,2,3],[-1,2,3],[1,2,3],[0,3,3],[-2,2,3],[-1,3,3],[1,3,3],[2,2,3],[0,4,3],[-2,3,3],[-1,4,3],[1,4,3],[2,3,3],[0,5,3],[3,3,3],[0,6,3],[3,4,3]]]],"entriesCount":82},{"entries":[[0,-1,3,[[0,-2,3],[-1,-1,3],[1,-1,3],[1,-2,3],[-1,-2,3],[0,-3,3],[-2,-1,3],[1,-3,3],[2,-2,3],[-2,-2,3],[-1,-3,3],[2,-3,3],[-3,-2,3]]],[1,0,3,[[2,0,3],[2,-1,3],[2,1,3],[3,0,3],[3,-1,3],[3,1,3],[4,0,3],[3,-2,3],[4,-1,3],[4,1,3],[5,0,3],[5,-1,3],[5,1,3],[6,0,3]]],[-1,0,3,[[-2,0,3],[-2,1,3],[-3,0,3],[-3,1,3],[-3,-1,3],[-4,0,3],[-4,1,3],[-4,-1,3],[-5,0,3],[-5,1,3],[-5,-1,3],[-6,0,3],[-6,1,3],[-5,2,3]]],[0,1,3,[[1,1,3],[-1,1,3],[0,2,3],[1,2,3],[-1,2,3],[0,3,3],[1,3,3],[2,2,3],[-2,2,3],[-1,3,3],[3,2,3],[-2,3,3],[-3,2,3],[-1,4,3],[-3,3,3],[-2,4,3],[-4,2,3],[-4,3,3]]]],"entriesCount":63},{"entries":[[0,1,3,[[0,2,3],[-1,1,3],[0,3,3],[1,2,3],[-1,2,3],[-2,1,3],[-1,3,3],[-2,2,3],[-3,2,3]]],[0,-1,3,[[0,-2,3],[1,-1,3],[0,-3,3],[-1,-2,3],[1,-2,3],[-1,-3,3],[0,-4,3],[1,-3,3],[-2,-2,3],[2,-2,3],[-1,-4,3],[-2,-3,3]]],[-1,0,3,[[-1,-1,3],[-2,0,3],[-2,-1,3],[-3,0,3],[-3,-1,3],[-4,0,3],[-3,1,3],[-3,-2,3],[-4,-1,3],[-4,1,3],[-3,-3,3]]],[1,0,3,[[1,1,3],[2,0,3],[2,1,3],[2,-1,3],[3,0,3],[2,2,3],[3,1,3],[3,-1,3],[4,0,3],[3,2,3],[4,1,3],[5,1,3]]]],"entriesCount":48},{"entries":[[-1,0,3,[[-2,0,3],[-1,1,3],[-1,-1,3],[-2,-1,3],[-2,1,3],[-3,0,3],[-2,-2,3],[-3,-1,3],[-3,1,3],[-2,2,3]]],[0,1,3,[[1,1,3],[0,2,3],[1,2,3],[-1,2,3],[0,3,3],[1,3,3],[2,2,3],[-1,3,3],[0,4,3],[1,4,3],[2,3,3],[-1,4,3],[-2,3,3],[0,5,3],[2,4,3],[3,3,3],[-1,5,3],[3,4,3]]],[1,0,3,[[1,-1,3],[2,0,3],[2,-1,3],[3,0,3],[2,1,3],[2,-2,3],[3,1,3]]],[0,-1,3,[[0,-2,3],[1,-2,3],[0,-3,3],[-1,-2,3],[1,-3,3],[-1,-3,3],[0,-4,3],[1,-4,3],[2,-3,3],[-1,-4,3],[-2,-3,3],[0,-5,3],[2,-4,3],[1,-5,3],[3,-3,3],[-1,-5,3],[-2,-4,3],[3,-4,3]]]],"entriesCount":57},{"entries":[[0,1,3,[[-1,1,3],[0,2,3],[-1,2,3],[1,2,3],[0,3,3],[-1,3,3],[-2,2,3],[1,3,3],[2,2,3],[-2,3,3],[-3,2,3],[2,3,3]]],[-1,0,3,[[-2,0,3],[-1,-1,3],[-2,1,3],[-3,0,3],[-2,-1,3],[-3,1,3],[-3,-1,3],[-4,0,3],[-2,-2,3],[-4,1,3],[-3,-2,3],[-4,-1,3],[-3,-3,3],[-4,-2,3],[-4,-3,3],[-5,-2,3],[-4,-4,3],[-5,-3,3],[-5,-4,3],[-6,-3,3],[-6,-4,3]]],[0,-1,3,[[1,-1,3],[0,-2,3],[1,-2,3],[2,-1,3],[0,-3,3],[-1,-2,3],[2,-2,3],[1,-3,3],[-1,-3,3],[2,-3,3],[3,-2,3],[1,-4,3],[-2,-3,3],[-1,-4,3],[3,-3,3],[2,-4,3],[-2,-4,3],[-1,-5,3],[2,-5,3],[-2,-5,3],[-3,-4,3],[-2,-6,3],[-3,-5,3]]],[1,0,3,[[2,0,3],[1,1,3],[2,1,3],[3,0,3],[3,1,3],[4,0,3],[3,-1,3],[4,1,3],[3,2,3],[5,0,3],[4,-1,3],[4,2,3],[5,-1,3],[4,-2,3],[5,-2,3],[6,-1,3],[4,-3,3],[5,-3,3],[6,-2,3],[7,-1,3],[4,-4,3],[6,-3,3],[5,-4,3],[7,-2,3],[4,-5,3],[5,-5,3]]]],"entriesCount":86},{"entries":[[0,1,3,[[0,2,3],[-1,1,3],[-1,2,3],[-1,3,3],[-2,2,3],[-2,3,3],[-3,2,3],[-3,3,3],[-2,4,3],[-3,4,3]]],[-1,0,3,[[-2,0,3],[-2,1,3],[-3,0,3],[-3,1,3],[-4,1,3],[-4,2,3]]],[0,-1,3,[[0,-2,3],[-1,-1,3],[1,-1,3],[-1,-2,3],[1,-2,3],[2,-2,3],[2,-3,3],[3,-3,3],[3,-4,3]]],[1,0,3,[[1,1,3],[2,0,3],[2,1,3],[3,0,3],[2,-1,3],[2,2,3],[3,1,3],[3,-1,3],[4,0,3],[4,1,3],[3,-2,3],[4,-2,3]]]],"entriesCount":41},{"entries":[[0,-1,3,[[1,-1,3],[0,-2,3],[1,-2,3],[0,-3,3],[-1,-2,3],[2,-2,3],[1,-3,3],[3,-2,3],[2,-3,3],[3,-3,3],[4,-2,3],[2,-4,3],[3,-4,3]]],[1,0,3,[[2,0,3],[2,-1,3],[3,0,3],[2,1,3],[3,-1,3],[4,0,3],[3,1,3],[4,-1,3],[5,0,3],[5,-1,3]]],[0,1,3,[[1,1,3],[0,2,3],[1,2,3],[-1,2,3],[2,2,3],[1,3,3],[-2,2,3]]],[-1,0,3,[[-1,1,3],[-1,-1,3],[-2,0,3],[-2,1,3],[-2,-1,3],[-3,0,3],[-3,1,3],[-3,-1,3],[-4,0,3],[-4,1,3],[-4,-1,3],[-5,0,3],[-5,1,3]]]],"entriesCount":47}];

let TRUNK_TEXTURE = [
    [133, 108, 80],
    [124, 97, 67],
];

let LEAF_TEXTURE_1 = [
    [128,137,79],
    [128,137,79],
    [128,137,79],
    [128,137,79],
    [128,137,79],
    [141,149,91],
    [141,149,91],
    [117,128,71],
    [99,110,65],
    [111,123,68],
    [121,132,73],
    [111,123,74],
];

let LEAF_TEXTURE_2 = [
    [74,86,47],
    [74,86,47],
    [74,86,47],
    [74,86,47],
    [68,77,40],
    [68,77,40],
    [68,77,40],
    [70,82,42],
    [70,82,42],
    [70,82,42],
    [72,82,46],
    [72,82,46],
    [78,90,48],
    [78,90,48],
    [95,106,60],
    [88,100,57],
    [66,74,36],
    [66,67,35],
    [76,87,52],
    [86,100,53],
    [75,89,47],
];
