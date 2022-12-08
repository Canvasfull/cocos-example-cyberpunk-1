import { _decorator, Component, Node, Label, Sprite, Button, EditBox, Toggle, Slider } from 'cc';
import { FilSmooth } from '../ui/fil-smooth';
const { ccclass, property } = _decorator;


export type type_x_y = {
    x: number,
    y: number,
}

export type ComponentTypes = 
{ new () : Label } | 
{ new () : Sprite } | 
{ new () : EditBox } | 
{ new () : Toggle } |
{ new () : Slider } |
{ new () : FilSmooth }

export type ComponentType = Constructor | AbstractedConstructor;

export type Constructor<T = unknown> = new (...args: any[]) => T;

export type AbstractedConstructor<T = unknown> = abstract new (...args: any[]) => T;