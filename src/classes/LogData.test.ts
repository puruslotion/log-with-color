import { Level } from "../enums/Level"
import { FieldSet } from "../types/FieldSet"
import { TagSet } from "../types/TagSet"
import { LogData } from "./LogData"
import { Logger } from "./Logger"

describe("LogData class", () => {
    let logData = new LogData(new Date("2022-12-24").getTime(), Level.Information, "Hello world")
    let logData2 = new LogData(new Date("2022-12-24").toISOString(), Level.Information, "Hello world", "measurementName", [{
        key: "sensor", 
        value: "oxygen"
    }], [{
        key: "airSaturation", 
        value: 99.98
    }, {
        key: "online",
        value: true
    }])

    it("getLevel", () =>{
        expect(logData.getLevel()).toBe("INF")
    })

    it("getTimestamp", () => {
        expect(logData.getTimestamp()).toBe(1671840000000)
        expect(logData2.getTimestamp()).toBe("2022-12-24T00:00:00.000Z")
    })

    it("getTagSets", () => {
        let tagSets: TagSet[] = [{
            key: "Level",
            value: "INF"
        }]
        let tagSets2: TagSet[] = [{
            key: "sensor", 
            value: "oxygen"
        },{
            key: "Level",
            value: "INF"
        }]
        expect(logData.getTagSets()).toEqual(tagSets)
        expect(logData2.getTagSets()).toEqual(tagSets2)
    })

    it("getMessage", () => {
        expect(logData.getMessage()).toBe("Hello world")
    })

    it("getFieldSets", () => {
        let fieldSets: FieldSet[] = [{
            key: "Message",
            value: "Hello world"
        }]
        let fieldSets2: FieldSet[] = [{
            key: "airSaturation", 
            value: 99.98
        }, {
            key: "online",
            value: true
        },{
            key: "Message",
            value: "Hello world"
        }]
        expect(logData.getFieldSets()).toEqual(fieldSets)
        expect(logData2.getFieldSets()).toEqual(fieldSets2)
    })

    it("getMeasurementName", () => {
        expect(logData.getMeasurementName()).toBe("Logger")
        expect(logData2.getMeasurementName()).toBe("measurementName")
    })

    it("getInfluxDBLineProtocol", () => {
        expect(logData.getInfluxDbLineProtocol()).toBe("Logger,Level=INF Message=\"Hello world\" 1671840000000000000")
        expect(logData2.getInfluxDbLineProtocol()).toBe("measurementName,sensor=oxygen,Level=INF airSaturation=99.98,online=true,Message=\"Hello world\" 1671840000000000000")
    })

    it("getMeasurementNameForInfluxDb", () => {
        expect(logData["getMeasurementNameForInfluxDb"]()).toBe("Logger")
        expect(logData2["getMeasurementNameForInfluxDb"]()).toBe("measurementName")

        let logData3 = new LogData(new Date().getTime(), Level.Information, "Hello world", "test_test-test test")
        expect(logData3["getMeasurementNameForInfluxDb"]()).toBe("test_test-test\\ test")
    })

    it("getTagSetsForInfluxDb", () => {
        expect(logData["getTagSetsForInfluxDb"]()).toBe("Level=INF")
        expect(logData2["getTagSetsForInfluxDb"]()).toBe("sensor=oxygen,Level=INF")
    })

    it("getFieldSetsForInfluxDb", () => {
        expect(logData["getFieldSetsForInfluxDb"]()).toBe("Message=\"Hello world\"")
        expect(logData2["getFieldSetsForInfluxDb"]()).toBe("airSaturation=99.98,online=true,Message=\"Hello world\"")
    })

    it("getTimestampForInfluxDb", () => {
        expect(logData["getTimestampForInfluxDb"]()).toBe(1671840000000000000)
    })

    it("convertToJsonStringified", () => {
        expect(logData["convertToJsonStringified"]()).toBe("{\"Timestamp\":1671840000000,\"Level\":\"INF\",\"TagSets\":[{\"key\":\"Level\",\"value\":\"INF\"}],\"Message\":\"Hello world\",\"FieldSets\":[{\"key\":\"Message\",\"value\":\"Hello world\"}],\"MeasurementName\":\"Logger\"}\n")
        expect(logData2["convertToJsonStringified"]()).toBe("{\"Timestamp\":\"2022-12-24T00:00:00.000Z\",\"Level\":\"INF\",\"TagSets\":[{\"key\":\"sensor\",\"value\":\"oxygen\"},{\"key\":\"Level\",\"value\":\"INF\"}],\"Message\":\"Hello world\",\"FieldSets\":[{\"key\":\"airSaturation\",\"value\":99.98},{\"key\":\"online\",\"value\":true},{\"key\":\"Message\",\"value\":\"Hello world\"}],\"MeasurementName\":\"measurementName\"}\n")
    })
})
