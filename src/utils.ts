// 数字处理工具
export const NumberUtils = (integer) => {
  return {
    // Calls a defined callback function on each element of an Number, and returns an array that contains the results.
    // 该方法只建议传入整数
    map: function (calback: Function) {
      const arry:Array<any> = [];
      for (let i:number = 0; i < integer; i++) {
        arry.push(calback(i))
      }
      return arry;
    }
  }
}
// 数组处理工具
export const ArrayUtils = (array:Array<any>) => {
  return {
    // 重现定义数组长度并且把原数组拷贝进去
    copyOf: function (newLength) {
      const newArry:Array<any> = [];
      NumberUtils(newLength).map((index) => {
        newArry.push(array[index]);
      })
      return newArry
    },
    // 传入第二维数组长度，将一纬数组等分成二纬数组
    toDyadicArray: function (length) {
      const oneLength = Math.ceil(array.length / length);
      const dyadicArray:Array<any> = [];
      for (let i = 0; i < oneLength; i++) {
        dyadicArray.push(array.splice(0, length));
      }
      return dyadicArray;
    },
    // 删除数组中制定的元素
    remove: function (index) {
      const newArray = [...array];
      if (index > -1) {
        newArray.splice(index, 1);
        return newArray
      }
      return array;
    },
    insert: function (item, index) {
      const newArray = [...array];
      newArray.splice(index, 0, item);
      return newArray;
    }
  }
}